import type { ReactNode } from 'react'
import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '../ui/input'
import { useUploader } from './useUploader'

interface UploaderContentProps {
  children: ReactNode | string
  className?: string
}
function UploaderContent({ children, className }: UploaderContentProps) {
  const { addFiles, accept, multiple, fileInputRef, handleInputChange } = useUploader()

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      className={cn(
        'size-full relative border-2 border-primary/20 border-dotted rounded-xl min-w-60 min-h-24  py-6 px-12',
        'hover:shadow-lg hover:border-primary/50 drop:border-primay',
        'transition-all duration-300 ease-in-out',
        className,
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleInputChange}
        className="absolute z-[-1] opacity-0 inset-0"
      >
      </Input>
      {children}
    </div>
  )
}

export const Cmp = memo(UploaderContent)
export default Cmp
