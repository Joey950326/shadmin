import type { ChangeEvent } from 'react'
import { EditIcon } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useAvatarUpload } from '@/services/api/hooks/useUser'

interface AvatarUploadPros {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  onUploadingChange?: (isUploading: boolean) => void
}

function AvatarUpload({ value, onValueChange, disabled, onUploadingChange }: AvatarUploadPros) {
  const [avatarUrl, setAvatarUrl] = useState<string>(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate, isPending } = useAvatarUpload()

  useEffect(() => {
    setAvatarUrl(value)
  }, [value])

  useEffect(() => onUploadingChange?.(isPending), [isPending, onUploadingChange])

  const handleUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件', {
        position: 'top-right',
      })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB', {
        position: 'top-right',
      })
      return
    }
    // 本地即时预览
    const objectUrl = URL.createObjectURL(file)
    setAvatarUrl(objectUrl)
    mutate({ file }, {
      onSuccess: (data) => {
        onValueChange(data?.data?.fileUrl || value)
        toast.success('上传成功', {
          position: 'top-right',
        })
      },
      onError: (error) => {
        toast.error('上传失败', {
          position: 'top-right',
        })
        setAvatarUrl(value)
        console.error(error)
      },

    })
  }
  /** 协助ObjectUrl，避免内存占用 */
  useEffect(() => () => {
    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl)
    }
  }, [avatarUrl])

  return (
    <Avatar className="relative h-20 p-2 flex justify-center overflow-hidden">
      <AvatarImage className="w-full z-1" src={avatarUrl} loading="lazy" />
      <AvatarFallback>
        头像
      </AvatarFallback>
      {/* 上传组件 */}
      <Input
        ref={inputRef}
        className="absolute inset-0 size-full z-[-1] opacity-0 bg-transparent"
        type="file"
        accept="image/*"
        onChange={handleUploadChange}
        disabled={isPending || disabled}
      >
      </Input>
      {/* 遮罩 */}
      <div className="absolute inset-0 z-20 size-full bg-primary/20 flex items-center justify-center text-xs opacity-0 hover:opacity-100 transition-all duration-300 ease-in-out" onClick={() => { inputRef?.current?.click() }}>
        <EditIcon color="var(--muted)" />
      </div>
    </Avatar>
  )
}

export default memo(AvatarUpload)
