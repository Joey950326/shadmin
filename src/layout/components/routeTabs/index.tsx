import type { MenuItem } from '../MenuItem'
import type { ChangeEvent } from './types'
import type { RouteTabView } from '@/features/routeTabs'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useRouteTabActions } from '@/features/routeTabs'
import useMenu from '@/hooks/useMenu'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAppState } from '@/store/modules/app'
import { clearPendingClosePath, closeAllRouteTabs, selectTabsData, updateTabsData } from '@/store/modules/tabs'
import RouteTabAction from './RouteTabAction'
import RouteTabItem from './RouteTabItem'
import RouteTabList from './RouteTabList'
import RouteTabs from './RouteTabs'

function getActiveMenuItem(path: string, menuData: MenuItem[]): MenuItem | null {
  for (const item of menuData) {
    if (item.path === path) {
      return item
    }
    if (item.children) {
      const found = getActiveMenuItem(path, item.children)
      if (found) {
        return found
      }
    }
  }
  return null
}

export default function RouteTabsIndex() {
  const showTabs = useAppSelector<boolean>(state => state.app.showTabs)
  const tabsData = useAppSelector(selectTabsData)
  const pendingClosePath = useAppSelector(state => state.tabs.pendingClosePath)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { closeTab } = useRouteTabActions()
  const activeTabRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const { menuData } = useMenu()

  const tabs: RouteTabView[] = useMemo(() => tabsData.map(tab => ({
    ...tab,
    title: tab.customTitle ?? getActiveMenuItem(tab.path, menuData)?.meta?.title ?? tab.path,
  })), [menuData, tabsData])
  const activeTabItem = useMemo(() => tabs.find(tab => tab.active), [tabs])

  const handleTabsChange = useCallback((event: ChangeEvent) => {
    if (event.type === 'select') {
      dispatch(updateTabsData(tabsData.map(tab => ({ ...tab, active: tab.path === event.tabItem.path }))))
    }
    else {
      closeTab(event.tabItem.path)
    }
  }, [closeTab, dispatch, tabsData])

  useEffect(() => {
    const hasCurrentTab = tabsData.some(tab => tab.path === location.pathname)
    const isClosingCurrentTab = pendingClosePath === location.pathname
    const nextTabsData = tabsData.map(tab => ({
      ...tab,
      active: isClosingCurrentTab ? tab.active : tab.path === location.pathname,
    }))
    if (!hasCurrentTab && !isClosingCurrentTab && getActiveMenuItem(location.pathname, menuData)) {
      nextTabsData.push({ path: location.pathname, active: true })
    }
    const changed = nextTabsData.length !== tabsData.length
      || nextTabsData.some((tab, index) => tab.path !== tabsData[index]?.path || tab.active !== tabsData[index]?.active)
    if (changed) {
      dispatch(updateTabsData(nextTabsData))
    }
    if (pendingClosePath && pendingClosePath !== location.pathname) {
      dispatch(clearPendingClosePath())
    }
  }, [dispatch, location.pathname, menuData, pendingClosePath, tabsData])

  const handleFreshTab = useCallback(() => {
    dispatch(setAppState({ tabsReloadFlag: false }))
    setTimeout(() => dispatch(setAppState({ tabsReloadFlag: true })), 300)
  }, [dispatch])

  const handleCloseCurrentTab = useCallback(() => {
    if (activeTabItem) {
      closeTab(activeTabItem.path)
    }
  }, [activeTabItem, closeTab])

  const handleCloseOtherTab = useCallback(() => {
    if (activeTabItem) {
      dispatch(updateTabsData(tabsData.filter(tab => tab.path === activeTabItem.path || tab.path === '/home/index')))
    }
  }, [activeTabItem, dispatch, tabsData])

  const handleCloseAllTab = useCallback(() => {
    dispatch(closeAllRouteTabs(location.pathname))
    navigate('/home/index')
  }, [dispatch, location.pathname, navigate])

  return (
    showTabs && tabs.length > 0 && (
      <RouteTabs
        className=" h-11 w-full border-b-foreground/10 bg-background"
        activeTabItem={activeTabItem}
        activeTabRef={activeTabRef}
        scrollContainerRef={scrollContainerRef}
        onChange={handleTabsChange}
        onFreshTab={handleFreshTab}
        onCloseCurrentTab={handleCloseCurrentTab}
        onCloseOtherTab={handleCloseOtherTab}
        onCloseAllTab={handleCloseAllTab}
      >
        <RouteTabList className="h-full flex-1 flex items-center pt-1 px-2 shadow-xl">
          {tabs.map(tab => <RouteTabItem key={tab.path} tabItem={tab} />)}
        </RouteTabList>
        <RouteTabAction />
      </RouteTabs>
    )
  )
}
