import type { ReactNode } from 'react'

export interface TreeItemValue {
  id: string
  children?: Array<TreeItemValue>
  name: string
}

export interface TreeSelectorProps {
  selectValue: Array<TreeItemValue>
  selectedIds?: Array<string>
  onSelectedChange?: (selectedIds: Array<string>) => void
  className?: string
  placeholder?: string
  children: ReactNode
  isLoading: boolean
}
