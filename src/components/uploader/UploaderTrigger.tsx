import type { ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { isValidElement, memo } from 'react'
import { Button } from '@/components/ui/button'
import { useUploader } from './useUploader'

interface UploaderTriggerProps {
  children?: ReactNode
  asChild?: boolean
}

function UploaderTrigger({ children }: UploaderTriggerProps) {
  const { fileInputRef, isUploading } = useUploader()

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  if (isValidElement(children)) {
    return (
      <Slot
        onClick={handleClick}
      >
        {children}

      </Slot>
    )
  }

  return (
    <Button
      disabled={isUploading}
      onClick={handleClick}
    >
      选择文件
    </Button>
  )
}

export const Cmp = memo(UploaderTrigger)

export default Cmp
