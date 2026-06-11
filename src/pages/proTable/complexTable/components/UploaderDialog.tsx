import type { ReactNode } from 'react'
import type { FileWithPreview } from '@/components/uploader/types'
import { DownloadIcon, FolderUpIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Uploader, UploaderContent, UploaderDescription, UploaderFileList, UploaderTrigger } from '@/components/uploader'
import { useImportUser } from '@/services/api/hooks/useUser'

interface UploaderDialogProps {
  children?: ReactNode | string
}

export default function UploaderDialog({ children }: UploaderDialogProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [selectedFiles, setSelectedFiles] = useState<Array<FileWithPreview>>([])
  const { mutate, isPending } = useImportUser()
  const handleConfirm = useCallback(() => {
    if (selectedFiles.length > 0) {
      mutate({ file: selectedFiles[0] }, {
        onSuccess() {
          toast.success('导入成功', {
            position: 'top-right',
          })
        },
        onError(error) {
          console.error('导入用户失败：', error)
          toast.error('导入用户失败', {
            position: 'top-right',
          })
        },
        onSettled() {
          setDialogOpen(false)
        },
      })
    }
  }, [mutate, selectedFiles])
  // 上传逻辑
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {
          children
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量导入</DialogTitle>
          <DialogDescription>
            批量添加新用户
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex:col sm:flex-row sm:items-center gap-2">
            <Label>模板下载</Label>
            <Button size="sm" variant="outline">
              <DownloadIcon />
              点击下载
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Label>文件上传</Label>
            <Uploader onUpload={setSelectedFiles}>
              <UploaderContent className="gap-2">
                <div className="size-full flex flex-col items-center gap-4">
                  <Button variant="outline" size="icon" className="size-12 pointer-events-none">
                    <FolderUpIcon className="size-6 text-primary/60" />
                  </Button>
                  <div>将文件拖到此处，或点击按钮上传</div>
                  <UploaderTrigger>
                    <Button variant="outline" size="sm">
                      选择文件
                    </Button>
                  </UploaderTrigger>

                </div>
              </UploaderContent>
              <UploaderDescription>
                请上传 .xls , .xlsx 标准格式文件，文件最大为 5M
              </UploaderDescription>
              <UploaderFileList />
            </Uploader>
          </div>

        </div>
        <DialogFooter>
          <div className="flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>

            <Button disabled={selectedFiles.length === 0 || isPending} onClick={handleConfirm}>
              确定
              {isPending && <Spinner />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
