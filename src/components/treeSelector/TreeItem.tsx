// components/department-tree/item.tsx
'use client'

import type { TreeItemValue } from './types'
import { ChevronRight } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useTreeSelector } from './TreeSelectorContext'

interface TreeItemProps {
  node: TreeItemValue
  level?: number
}

function TreeItem({ node, level = 0 }: TreeItemProps) {
  const {
    selectedIds,
    indeterminateIds,
    expandedIds,
    toggleSelect,
    toggleExpand,
  } = useTreeSelector()

  const hasChildren = (node.children?.length ?? 0) > 0
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedIds.has(node.id)
  const isIndeterminate = indeterminateIds.has(node.id) && !isSelected

  // 传递给 Checkbox 的 checked 值（Radix 支持 "indeterminate" 字符串）
  const checkedState = isIndeterminate ? 'indeterminate' : isSelected

  const handleSelect = useCallback(() => {
    toggleSelect(node.id)
  }, [node.id, toggleSelect])

  const handleExpand = useCallback(() => {
    if (hasChildren)
      toggleExpand(node.id)
  }, [node.id, hasChildren, toggleExpand])

  // 当前层级缩进样式
  const indentStyle = useMemo(() => ({
    paddingLeft: `${level * 1.25 + 0.5}rem`,
  }), [level])

  return (
    <div className="select-none">
      {/* 节点行 */}
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 hover:bg-accent rounded-md group cursor-default',

        )}
        style={indentStyle}
      >
        {/* 展开/收起按钮 */}
        {hasChildren
          ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 -ml-1 text-muted-foreground hover:text-foreground"
                onClick={handleExpand}
              >
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isExpanded && 'rotate-90',
                  )}
                />
              </Button>
            )
          : (
              <div className="w-5" />
            )}
        {/* Checkbox - 支持 indeterminate */}
        <Checkbox
          checked={checkedState} // ← 关键：支持 "indeterminate"
          onCheckedChange={handleSelect}
        />

        {/* 名称 - 点击也可展开 */}
        <span
          className="flex-1 text-sm truncate"
          onClick={handleExpand}
        >
          {node.name}
        </span>
      </div>

      {/* 子节点递归渲染 */}
      {hasChildren && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-200 ease-in',
            isExpanded ? 'max-h-max opacity-100' : 'h-0 opacity-0',
          )}

        >
          {node.children!.map(child => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(TreeItem)

TreeItem.displayName = 'TreeItem'
