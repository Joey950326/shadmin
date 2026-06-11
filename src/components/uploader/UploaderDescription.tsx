import type { ReactNode } from 'react'
import { memo } from 'react'

interface UploaderDescriptionProps {
  children?: ReactNode | string
}
function UploaderDescription({ children }: UploaderDescriptionProps) {
  return (
    <div className="text-xs text-muted-foreground py-2 truncate">{children}</div>
  )
}

export const Cmp = memo(UploaderDescription)

export default Cmp
