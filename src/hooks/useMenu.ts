import type { MenuItem } from '@/layout/components/MenuItem'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { QUERY_KEYS } from '@/services/api/keys'
import { getMenuTreeApi, getUserMenusApi } from '@/services/api/modules/menu'
import { useAppSelector } from '@/store/hooks'
import { selectUserInfo } from '@/store/modules/user'
import { buildAuthorizedMenu, isAuthorizedPagePath } from './menuNavigation'

function findActiveMenu(menuData: MenuItem[], pathname: string): MenuItem | null {
  for (const menu of menuData) {
    if (menu.path === pathname) {
      return menu
    }
    if (menu.children) {
      const found = findActiveMenu(menu.children, pathname)
      if (found) {
        return found
      }
    }
  }
  return null
}

export default function useMenu() {
  const { i18n } = useTranslation()
  const location = useLocation()
  const userInfo = useAppSelector(selectUserInfo)
  const { data, isError } = useQuery({
    queryKey: QUERY_KEYS.MENU.AUTHORIZED_NAVIGATION(userInfo?.username ?? null),
    queryFn: async () => {
      const [treeResponse, userMenusResponse] = await Promise.all([
        getMenuTreeApi(),
        getUserMenusApi(),
      ])
      return {
        tree: treeResponse.data ?? [],
        menuIds: userMenusResponse.data?.menuIds ?? [],
      }
    },
    enabled: Boolean(userInfo?.username),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  })
  const menuData = useMemo(() => {
    return data
      ? buildAuthorizedMenu(data.tree, data.menuIds, i18n.resolvedLanguage || i18n.language)
      : []
  }, [data, i18n.language, i18n.resolvedLanguage])

  const currentMenu = useMemo(() => {
    return findActiveMenu(menuData, location.pathname)
  }, [location.pathname, menuData])

  const currentRouteAuthorized = useMemo(() => {
    if (!data) {
      return undefined
    }

    return isAuthorizedPagePath(data.tree, data.menuIds, location.pathname)
  }, [data, location.pathname])

  return {
    menuData,
    currentMenu,
    currentRouteAuthorized,
    isLoading: !data && !isError,
    hasError: isError,
  }
}
