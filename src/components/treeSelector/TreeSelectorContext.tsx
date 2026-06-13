import type { TreeItemValue } from './types'
import { createContext, use } from 'react'

export interface TreeSelectorContextValue<T = TreeItemValue> {
  selectedIds: Set<string>
  indeterminateIds: Set<string>
  expandedIds: Set<string>
  searchTerm?: string
  filteredDepartments: T[]
  isLoading: boolean
  setSearchTerm: (term: string) => void
  toggleSelect: (id: string) => void
  toggleExpand: (id: string) => void
}

export const TreeSelectorContext = createContext<TreeSelectorContextValue | null>(null)

export function useTreeSelector() {
  const context = use(TreeSelectorContext)
  if (!context) {
    throw new Error('useTreeSelector必须在TreeSeletor组件内使用')
  }
  return context
}
