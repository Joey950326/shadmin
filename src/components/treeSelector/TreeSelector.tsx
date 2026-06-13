import type { TreeSelectorContextValue } from './treeSelectorContext'
import type { TreeItemValue, TreeSelectorProps } from './types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { TreeSelectorContext } from './treeSelectorContext'
import { filterTree, getAllDescendantIds, isIndeterminate } from './utils'

function TreeSelector({
  selectValue,
  selectedIds: controlledSelectedIds = [],
  className,
  children,
  onSelectedChange,
  isLoading,
}: TreeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [internalSelected, setInternalSelected] = useState<Set<string>>(() => new Set(controlledSelectedIds))
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  // 受控/非受控选中状态
  const selectedIds: Set<string> = useMemo(() => {
    return new Set(controlledSelectedIds.length > 0 ? controlledSelectedIds : internalSelected)
  }, [controlledSelectedIds, internalSelected])

  // 计算半选中状态
  const indeterminateIds = useMemo(() => {
    const indet = new Set<string>()
    const traverse = (nodes: TreeItemValue[]) => {
      nodes.forEach((node) => {
        if (isIndeterminate(node, selectedIds)) {
          indet.add(node.id)
        }
        if (node.children?.length)
          traverse(node.children)
      })
    }
    traverse(selectValue)
    return indet
  }, [selectValue, selectedIds])

  // 过滤后的树
  const filteredDepartments = useMemo(() => {
    return filterTree(selectValue, searchTerm)
  }, [selectValue, searchTerm])

  // 切换选中（父子联动）
  const toggleSelect = useCallback((id: string) => {
    const newSelected = new Set(selectedIds)
    const isCurrentlySelected = newSelected.has(id)

    // find node which toggle in tree
    const findNode = (nodes: TreeItemValue[]): TreeItemValue | null => {
      for (const node of nodes) {
        if (node.id === id)
          return node
        const found = findNode(node.children ?? [])
        if (found)
          return found
      }
      return null
    }

    const targetNode = findNode(selectValue)
    if (!targetNode)
      return

    // cancel node selected
    if (isCurrentlySelected) {
      // 取消选中自身及所有子孙
      const idsToRemove = new Set<string>()
      getAllDescendantIds(targetNode, idsToRemove)
      idsToRemove.forEach(i => newSelected.delete(i))
    }
    // select current node
    else {
      // 选中自身及所有子孙
      getAllDescendantIds(targetNode, newSelected)
    }

    setInternalSelected(newSelected)
    onSelectedChange?.(Array.from(newSelected))
  }, [selectedIds, selectValue, onSelectedChange])

  // 切换展开
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      // disExpand this node
      if (next.has(id))
        next.delete(id)
      // expand new node
      else next.add(id)
      return next
    })
  }, [])

  // 搜索时自动展开匹配路径
  useEffect(() => {
    if (!searchTerm)
      return
    const toExpand = new Set<string>()
    // 收集当前节点的祖先节点路径
    const collectAncestors = (nodes: TreeItemValue[], targetId: string): boolean => {
      for (const node of nodes) {
        if (node.id === targetId)
          return true
        if (node.children && collectAncestors(node.children, targetId)) {
          toExpand.add(node.id)
          return true
        }
      }
      return false
    }

    const traverse = (nodes: TreeItemValue[]) => {
      nodes.forEach((node) => {
        if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          collectAncestors(selectValue, node.id)
        }
        if (node.children)
          traverse(node.children)
      })
    }

    traverse(selectValue)

    if (toExpand.size > 0) {
      setExpandedIds(prev => new Set([...prev, ...toExpand]))
    }
  }, [searchTerm, selectValue])

  const contextValue: TreeSelectorContextValue = useMemo(
    () => ({
      selectedIds,
      indeterminateIds,
      expandedIds,
      searchTerm,
      filteredDepartments,
      isLoading,
      setSearchTerm,
      toggleSelect,
      toggleExpand,

    }),
    [selectedIds, indeterminateIds, expandedIds, searchTerm, filteredDepartments, isLoading, toggleSelect, toggleExpand],
  )

  return (
    <TreeSelectorContext value={contextValue}>
      <div className={cn('border rounded-xl bg-card overflow-hidden', className)}>
        {children}
      </div>
    </TreeSelectorContext>
  )
}

export default TreeSelector
