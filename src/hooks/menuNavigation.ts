import type { MenuItem } from '@/layout/components/MenuItem'
import type { Api } from '@/services/api/types/api'

export function isAuthorizedPagePath(
  tree: Api.Menu.Node[],
  authorizedPageIds: string[],
  pathname: string,
): boolean | undefined {
  function findPage(nodes: Api.Menu.Node[], ancestorsActive: boolean): boolean | undefined {
    for (const node of nodes) {
      const isActive = ancestorsActive && node.status === 1
      if (node.type === 'page' && node.path === pathname) {
        return isActive && authorizedPageIds.includes(node.id)
      }

      const result = findPage(node.children, isActive)
      if (result !== undefined) {
        return result
      }
    }

    return undefined
  }

  return findPage(tree, true)
}

export function buildAuthorizedMenu(
  tree: Api.Menu.Node[],
  authorizedPageIds: string[],
  language: string,
): MenuItem[] {
  const authorizedIds = new Set(authorizedPageIds)

  function filterNodes(nodes: Api.Menu.Node[]): MenuItem[] {
    return nodes.flatMap((node) => {
      if (node.status !== 1) {
        return []
      }

      if (node.type === 'page') {
        if (!authorizedIds.has(node.id) || !node.path) {
          return []
        }

        return [{
          name: node.id,
          path: node.path,
          meta: {
            icon: node.icon,
            title: language.startsWith('zh') ? node.nameZh : node.nameEn,
          },
        }]
      }

      const children = filterNodes(node.children)
      if (children.length === 0) {
        return []
      }

      return [{
        name: node.id,
        path: node.path || '#',
        meta: {
          icon: node.icon,
          title: language.startsWith('zh') ? node.nameZh : node.nameEn,
        },
        children,
      }]
    })
  }

  return filterNodes(tree)
}
