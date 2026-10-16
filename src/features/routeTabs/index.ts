import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeRouteTab, selectTabsData, updateTabsData } from '@/store/modules/tabs'

export interface RouteTabState {
  path: string
  active?: boolean
  customTitle?: string
}

export interface RouteTabView extends RouteTabState {
  title: string
}

export function useRouteTabActions() {
  const tabsData = useAppSelector(selectTabsData)
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()

  const closeTab = useCallback((path: string) => {
    const target = tabsData.find(tab => tab.path === path)
    if (!target || path === '/home/index') {
      return
    }

    const currentIndex = tabsData.findIndex(tab => tab.path === path)
    const isCurrentTab = target.active || location.pathname === path
    const nextPath = isCurrentTab
      ? tabsData[currentIndex + 1]?.path || tabsData[currentIndex - 1]?.path || '/home/index'
      : undefined

    dispatch(closeRouteTab({ path, nextPath }))
    if (nextPath) {
      navigate(nextPath)
    }
  }, [dispatch, location.pathname, navigate, tabsData])

  const setCustomTitle = useCallback((path: string, title: string) => {
    const customTitle = title.trim()
    if (!customTitle) {
      return
    }
    dispatch(updateTabsData(tabsData.map(tab => (
      tab.path === path ? { ...tab, customTitle } : tab
    ))))
  }, [dispatch, tabsData])

  const resetCustomTitle = useCallback((path: string) => {
    dispatch(updateTabsData(tabsData.map((tab) => {
      if (tab.path !== path || !tab.customTitle) {
        return tab
      }
      const { customTitle: _customTitle, ...rest } = tab
      return rest
    })))
  }, [dispatch, tabsData])

  return { closeTab, setCustomTitle, resetCustomTitle }
}
