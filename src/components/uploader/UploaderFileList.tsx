import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { UploaderFileItem } from './UploaderFileItem'
import { useUploader } from './useUploader'

interface UploaderFileListProps {
  className?: string
}

function UploaderFileList({ className }: UploaderFileListProps) {
  const { t } = useTranslation()
  const { files } = useUploader()
  //   console.log('files:', files)
  if (files.length === 0)
    return null
  return (
    <div className={cn('space-y-2 emt-2', className)}>
      <p className="text-sm font-medium">
        {t('file.selectedFiles', { count: files.length })}
      </p>
      {files.map((file, index) => (
        <UploaderFileItem key={`${file.name}-${index.toString()}`} file={file} index={index} />
      ))}
    </div>
  )
}

export const Cmp = memo(UploaderFileList)
export default Cmp
