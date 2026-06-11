import type { FileWithPreview } from './types'
import { XIcon } from 'lucide-react'
import { memo } from 'react'
import { transformFileSize } from '@/utils'
import { Button } from '../ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '../ui/item'
import { useUploader } from './useUploader'

interface UploaderFileItemProps {
  index: number
  file: FileWithPreview
}

export function UploaderFileItem({ index, file }: UploaderFileItemProps) {
  const { removeFile, isUploading } = useUploader()
  return (
    <Item variant="outline" size="sm" className="py-2 bg-primary/5">
      <ItemContent>
        <ItemTitle>{file.name}</ItemTitle>
        <ItemDescription className="text-xs">
          文件大小
          {' '}
          { transformFileSize(file.size) }
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="icon"
          disabled={isUploading}
          onClick={() => removeFile(index)}
        >
          <XIcon />
        </Button>
      </ItemActions>
    </Item>
  )
}

export const Cmp = memo(UploaderFileItem)
export default Cmp
