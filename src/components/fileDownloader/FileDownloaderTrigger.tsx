import type { ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { LoaderIcon } from 'lucide-react'

import { isValidElement, memo } from 'react'
import { Button } from '../ui/button'
import useFileDownloader from './useFileDownloader'

interface FileDownloaderTriggerProps {
  children?: ReactNode
}

function FileDownloaderTrigger({ children }: FileDownloaderTriggerProps) {
  const { download, isDownloading } = useFileDownloader()
  const handleDownload = () => {
    download()
  }
  if (children && isValidElement(children)) {
    return (
      <Slot
        onClick={handleDownload}
        {...{ disabled: isDownloading }}

      >
        {children}
      </Slot>
    )
  }

  return (
    <Button
      disabled={isDownloading}
      onClick={handleDownload}
      className="flex items-center"
    >
      {isDownloading ? '下载中' : '下载'}
      {isDownloading && <LoaderIcon />}

    </Button>
  )
}

export default memo(FileDownloaderTrigger)
