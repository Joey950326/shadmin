import type { TreeItemValue } from './types'

/** 判断节点或其后代是否匹配搜索词 */
export function isNodeOrDescendantMatch(node: TreeItemValue, term: string): boolean {
  if (!term)
    return true
  const lowerTerm = term.toLowerCase()
  if (node.name.toLowerCase().includes(lowerTerm))
    return true
  return (node.children ?? []).some(child => isNodeOrDescendantMatch(child, term))
}

/** 过滤树，仅保留匹配节点及其祖先路径 */
export function filterTree(nodes: TreeItemValue[], term: string): TreeItemValue[] {
  if (!term)
    return nodes

  return nodes
    .map((node) => {
      if (!isNodeOrDescendantMatch(node, term))
        return null

      const filteredChildren = filterTree(node.children ?? [], term)
      return {
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : undefined,
      }
    })
    .filter(Boolean) as TreeItemValue[]
}

/** 计算所有选中节点的 id（含子节点） */
export function getAllDescendantIds(node: TreeItemValue, ids: Set<string>): void {
  ids.add(node.id);
  (node.children ?? []).forEach(child => getAllDescendantIds(child, ids))
}

/** 判断节点是否全部选中 */
export function isFullySelected(node: TreeItemValue, selectedIds: Set<string>): boolean {
  if (!selectedIds.has(node.id))
    return false
  return (node.children ?? []).every(child => isFullySelected(child, selectedIds))
}

/** 判断节点是否半选中 */
export function isIndeterminate(node: TreeItemValue, selectedIds: Set<string>): boolean {
  if (isFullySelected(node, selectedIds))
    return false
  return (node.children ?? []).some(child =>
    selectedIds.has(child.id) || isIndeterminate(child, selectedIds),
  )
}
