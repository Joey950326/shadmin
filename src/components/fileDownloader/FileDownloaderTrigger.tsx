import type { ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { LoaderIcon } from 'lucide-react'

import { isValidElement, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import useFileDownloader from './useFileDownloader'

interface FileDownloaderTriggerProps {
  children?: ReactNode
}

function FileDownloaderTrigger({ children }: FileDownloaderTriggerProps) {
  const { t } = useTranslation()
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
      {isDownloading ? t('table.downloading') : t('download')}
      {isDownloading && <LoaderIcon />}

    </Button>
  )
}

export default memo(FileDownloaderTrigger)
