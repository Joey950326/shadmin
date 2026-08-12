import type { ReactNode } from 'react'
import type { FileWithPreview } from '@/components/uploader/types'
import { DownloadIcon, FolderUpIcon, LoaderIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileDownloader, FileDownloaderTrigger } from '@/components/fileDownloader'
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
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [selectedFiles, setSelectedFiles] = useState<Array<FileWithPreview>>([])
  const { mutate, isPending } = useImportUser()
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const handleConfirm = useCallback(() => {
    if (selectedFiles.length > 0) {
      mutate({ file: selectedFiles[0] }, {
        onSuccess() {
          toast.success(t('table.importSuccess'), {
            position: 'top-right',
          })
        },
        onError(error) {
          console.error('导入用户失败：', error)
          toast.error(t('table.importFailed'), {
            position: 'top-right',
          })
        },
        onSettled() {
          setDialogOpen(false)
        },
      })
    }
  }, [mutate, selectedFiles, t])
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
          <DialogTitle>{t('table.batchImport')}</DialogTitle>
          <DialogDescription>
            {t('table.batchImportDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex:col sm:flex-row sm:items-center gap-2">
            <Label>{t('table.downloadTemplate')}</Label>
            <FileDownloader fileName={t('table.userTemplate')} onDownloadingChange={setIsDownloading}>
              <FileDownloaderTrigger>
                <Button size="sm" variant="outline" disabled={isDownloading}>
                  {isDownloading ? <LoaderIcon /> : <DownloadIcon />}
                  {isDownloading ? t('table.downloading') : t('table.clickToDownload')}

                </Button>
              </FileDownloaderTrigger>
            </FileDownloader>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Label>{t('table.uploadFile')}</Label>
            <Uploader onUpload={setSelectedFiles}>
              <UploaderContent className="gap-2">
                <div className="size-full flex flex-col items-center gap-4">
                  <Button variant="outline" size="icon" className="size-12 pointer-events-none">
                    <FolderUpIcon className="size-6 text-primary/60" />
                  </Button>
                  <div>{t('table.dropFileHere')}</div>
                  <UploaderTrigger>
                    <Button variant="outline" size="sm">
                      {t('table.selectFile')}
                    </Button>
                  </UploaderTrigger>

                </div>
              </UploaderContent>
              <UploaderDescription>
                {t('table.uploadFileHint')}
              </UploaderDescription>
              <UploaderFileList />
            </Uploader>
          </div>

        </div>
        <DialogFooter>
          <div className="flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">{t('cancel')}</Button>
            </DialogClose>

            <Button disabled={selectedFiles.length === 0 || isPending} onClick={handleConfirm}>
              {t('confirm')}
              {isPending && <Spinner />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
