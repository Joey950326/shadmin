import type { ReactNode } from 'react'
import type { FileWithPreview } from './types'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { UploaderContext } from './UploaderContext'

interface UploaderProps {
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  children: ReactNode
  className?: string
  onUpload?: (file: Array<File | FileWithPreview>) => void
  onLoadingChange?: (isLoading: boolean) => void
}

function Uploader({
  accept = '.xlsx,.xls,.xlsm,.csv',
  multiple = false,
  maxFiles = 1, // 最多文件数量
  maxSize = 5, // 5MB
  children,
  className,
  onUpload,
  onLoadingChange,
}: UploaderProps) {
  const { t } = useTranslation()
  const [files, setFiles] = useState<Array<FileWithPreview>>([])
  const [isDragOver] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 判断文件是否符合 accept 要求
   * 支持 MIME 类型和扩展名两种方式
   */
  const isFileAccepted = useCallback((file: File): boolean => {
    if (accept === '*' || accept === '')
      return true

    const fileType = file.type.toLowerCase()
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))

    // 将 accept 拆分成数组（支持逗号分隔）
    const acceptedTypes = accept
      .toLowerCase()
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    return acceptedTypes.some((accepted) => {
      // MIME 类型匹配（如 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet）
      if (accepted.includes('/')) {
        return fileType === accepted || fileType.startsWith(accepted.replace('/*', '/'))
      }
      // 扩展名匹配（如 .xlsx）
      return accepted.startsWith('.') && fileExtension === accepted
    })
  }, [accept])

  const validateFiles = useCallback(
    (newFiles: File[]): File[] => {
      return newFiles.filter((file) => {
        // 校验文件数量
        if (files.length + newFiles.length > maxFiles) {
          toast.error(t('file.maxFiles', { count: maxFiles }), {
            position: 'top-right',
          })
          return false
        }
        // accept 类型校验
        if (!isFileAccepted(file)) {
          toast.error(t('file.unsupportedType', { name: file.name, accept }), {
            position: 'top-right',
          })
          return false
        }
        // 文件大小校验
        if (file.size > maxSize * 1024 * 1024) {
          toast.error(t('file.fileTooLarge', { name: file.name, size: maxSize }), {
            position: 'top-right',
          })
          return false
        }

        return true
      })
    },
    [accept, files.length, isFileAccepted, maxFiles, maxSize, t],
  )

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)

      const validFiles = validateFiles(fileArray)

      const totalFiles = [...files, ...validFiles].slice(0, maxFiles)

      const filesWithPreview = totalFiles.map((file) => {
        const existing = files.find(f => f.name === file.name && f.size === file.size)
        if (existing)
          return existing

        const fileWithPreview = file as FileWithPreview
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file)
        }
        return fileWithPreview
      })

      setFiles(filesWithPreview)
    },
    [files, maxFiles, validateFiles],
  )

  const removeFile = useCallback((index: number) => {
    const fileToRemove = files[index]
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [files])

  // 如果后端需要先上传excel再通过确定进行交互
  // 可以在这里写上传逻辑
  const handleUpload = useCallback(async () => {
    if (files.length === 0 || !onUpload)
      return

    setIsUploading(true)
    try {
      // 模拟真实上传进度（生产环境替换为实际 axios/fetch 逻辑）
      const updatedFiles = [...files]
      for (let i = 0; i < updatedFiles.length; i++) {
        for (let progress = 0; progress <= 100; progress += 10) {
          updatedFiles[i] = { ...updatedFiles[i], uploadProgress: progress }
          setFiles([...updatedFiles])
          await new Promise(resolve => setTimeout(resolve, 80))
        }
      }
      await onUpload(files)
    }
    catch (error) {
      console.error('上传失败', error)
    }
    finally {
      setIsUploading(false)
    }
  }, [files, onUpload])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
    //   console.info('handleInputChanfe:', e.target.files[0])
      addFiles(e.target.files)
      // 清空 input 值，允许重复选择同一个文件
      e.target.value = ''
    }
  }, [addFiles])

  const openFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const contextValue = useMemo(
    () => ({
      files,
      isDragOver,
      isUploading,
      accept,
      multiple,
      maxFiles,
      maxSize,
      fileInputRef,
      handleInputChange,
      openFileSelect,
      addFiles,
      removeFile,
      handleUpload,
      onUpload, // 用于组件外回调
    }),
    [files, isDragOver, isUploading, accept, multiple, maxFiles, maxSize, handleInputChange, openFileSelect, addFiles, removeFile, handleUpload, onUpload],
  )

  useEffect(() => {
    onUpload?.(files)
  }, [files, onUpload])

  useEffect(() => {
    onLoadingChange?.(isUploading)
  }, [isUploading, onLoadingChange])

  return (
    <UploaderContext value={contextValue}>
      <div className={cn('', className)}>
        {children}
      </div>
    </UploaderContext>
  )
}

export const Cmp = memo(Uploader)
export default Cmp
