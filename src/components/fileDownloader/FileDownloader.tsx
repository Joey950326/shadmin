import type { ReactNode } from 'react'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useUserImportDownload } from '@/services/api/hooks/useUser'
import { getDateNowText } from '@/utils'
import { FileDownloaderContext } from './FileDownloaderContext'

interface FileDownloaderProps {
  children: ReactNode
  //   download: () => void // 下载函数
  fileType?: string
  fileName?: string
  onDownloadingChange?: (isDownloading: boolean) => void
}

interface FileSelectorParams {
  fileName: string
  fileType: string
  blob: Blob
}

async function openSystemFileSelector({ fileName, fileType, blob }: FileSelectorParams) {
  if (window && 'showSaveFilePicker' in window) {
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: `${fileName}${fileType}`,
      types: [
        {
          description: `${fileType} 文件`,
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [fileType],
          },
        },
      ],
    })

    const writable = await handle.createWritable()
    await writable.write(blob)
    await writable.close()
    return true
  }
  return false
}

function FileDownloader({ children, fileName, fileType = '.xlsx', onDownloadingChange }: FileDownloaderProps) {
  const { t } = useTranslation()
  const downloadFileName = fileName ?? t('file.downloadContent')
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const { refetch } = useUserImportDownload({})

  const download = useCallback(async () => {
    try {
      setIsDownloading(true)
      onDownloadingChange?.(true)

      toast.warning(t('file.downloadWarning'), {
        position: 'top-right',
      })

      const refetchResult = await refetch()

      if (refetchResult.isSuccess) {
        const fileData = refetchResult

        if (!fileData) {
          throw new Error(t('file.noFileData'))
        }

        const blob = new Blob([JSON.stringify(fileData.data)])

        const uniqueFilename = `${downloadFileName}-${getDateNowText()} `

        const writeSuccess = await openSystemFileSelector({ fileName: uniqueFilename, fileType, blob })

        if (!writeSuccess) {
          const blobUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = `${uniqueFilename}${fileType}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(blobUrl)
        }
      }

      if (refetchResult.isError) {
        toast.error(t('file.downloadTemplateFailed'), { position: 'top-right' })
        console.error(refetchResult.error)
      }
    }
    catch (error) {
      console.error(error)
    }
    finally {
      setIsDownloading(false)
      onDownloadingChange?.(false)
    }
  }, [downloadFileName, fileType, onDownloadingChange, refetch, t])

  const contextValue = useMemo(() => ({
    isDownloading,
    download,
  }), [download, isDownloading])

  return (
    <FileDownloaderContext value={contextValue}>
      {children}
    </FileDownloaderContext>

  )
}

export default memo(FileDownloader)
