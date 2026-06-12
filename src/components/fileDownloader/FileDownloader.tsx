import type { ReactNode } from 'react'
import { memo, useCallback, useMemo, useState } from 'react'
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

function FileDownloader({ children, fileName = '下载内容', fileType = '.xlsx', onDownloadingChange }: FileDownloaderProps) {
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const { refetch } = useUserImportDownload({})

  const download = useCallback(async () => {
    try {
      setIsDownloading(true)
      onDownloadingChange?.(true)

      toast.warning('如果数据量太大，下载时间会稍长，请耐心等待', {
        position: 'top-right',
      })

      const refetchResult = await refetch()

      if (refetchResult.isSuccess) {
        const fileData = refetchResult

        if (!fileData) {
          throw new Error('没有返回文件数据')
        }

        const blob = new Blob([JSON.stringify(fileData.data)])

        const uniqueFilename = `${fileName}-${getDateNowText()} `

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
        toast.error('下载模板失败', { position: 'top-right' })
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
  }, [fileName, fileType, refetch, onDownloadingChange])

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
