import type { MenuItem } from '../MenuItem'
import type { ChangeEvent, RouteTab } from './types'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import useMenu from '@/hooks/useMenu'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAppState } from '@/store/modules/app'
import { selectTabsData, updateTabsData } from '@/store/modules/tabs'
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
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const timersRef = useRef<number[]>([])

  const cleanUptimers = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current = []
  }, [])

  const { menuData } = useMenu()

  const initialTabsData: RouteTab[] = useAppSelector(selectTabsData)

  const activeTabRef = useRef<HTMLDivElement | null>(null)

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const syncTabsData = useCallback((tabsData: RouteTab[]) => {
    dispatch(updateTabsData(tabsData))
  }, [dispatch])

  const activeTabItem = useMemo(() => {
    return initialTabsData.find(tab => tab.active)
  }, [initialTabsData])

  const handleTabsChange = useCallback((e: ChangeEvent) => {
    if (e.type === 'select') {
      const newTabsData = initialTabsData.map(tabItem => ({
        ...tabItem,
        active: tabItem.path === e.tabItem.path,
      }))

      syncTabsData(newTabsData)
    }
    else if (e.type === 'remove') {
      let nextPath = ''
      let newTabsData: RouteTab[] = []
      if (e.tabItem.active) {
        const currentIndex = initialTabsData.findIndex(tab => tab.path === e.tabItem.path)
        const nextTab = initialTabsData[currentIndex + 1] || initialTabsData[currentIndex - 1]
        nextPath = nextTab?.path || '/home/index'
        newTabsData = initialTabsData.filter(tab => tab.path !== e.tabItem.path).map(tab => ({ ...tab, active: tab.path === nextPath }))
      }
      else {
        newTabsData = initialTabsData.filter(tab => tab.path !== e.tabItem.path)
      }

      syncTabsData(newTabsData)

      if (nextPath) {
        timersRef.current.push(
          setTimeout(() => {
            navigate(nextPath)
          }, 200),
        )
      }
    }
  }, [initialTabsData, navigate, syncTabsData])

  useEffect(() => {
    // 设置标签页数据，保持与路由同步
    const inTabsData = initialTabsData.some(tabItem => tabItem.path === location.pathname)
    let newTabsData = initialTabsData.map(tabItem => ({
      ...tabItem,
      active: tabItem.path === location.pathname,
    }))
    if (!inTabsData) {
      newTabsData = [...newTabsData, { title: getActiveMenuItem(location.pathname, menuData)?.meta?.title || '未知页面', path: location.pathname, active: true }]
    }
    syncTabsData(newTabsData)

    return () => {
    // 清理定时器，防止内存泄漏
      cleanUptimers()
    }
  }, [cleanUptimers, location.pathname, menuData, syncTabsData])

  /** 刷新标签 */
  const handleFreshTab = useCallback(() => {
    dispatch(setAppState({ tabsReloadFlag: false }))
    setTimeout(() => {
      dispatch(setAppState({ tabsReloadFlag: true }))
    }, 300)
  }, [dispatch])

  /** 关闭当前 */
  const handleCloseCurrentTab = useCallback(() => {
    if (activeTabItem && activeTabItem.path !== '/home/index') {
      handleTabsChange({ type: 'remove', tabItem: activeTabItem })
    }
  }, [activeTabItem, handleTabsChange])

  /** 关闭其他 */
  const handleCloseOtherTab = useCallback(() => {
    if (activeTabItem) {
      const newTabDatas = initialTabsData.filter(tab => tab.path === activeTabItem.path || tab.path === '/home/index')
      syncTabsData(newTabDatas)
    }
  }, [activeTabItem, initialTabsData, syncTabsData])

  /** 关闭全部 */
  const handleCloseAllTab = useCallback(() => {
    const newTabsData = initialTabsData.filter(tab => tab.path === '/home/index')
    syncTabsData(newTabsData)
    timersRef.current.push(
      setTimeout(() => {
        navigate('/home/index')
      }, 200),
    )
  }, [initialTabsData, navigate, syncTabsData])

  return (
    showTabs && initialTabsData.length > 0 && (
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
          {initialTabsData.map(tab => (
            <RouteTabItem key={tab.path} tabItem={tab} />
          ))}
        </RouteTabList>
        <RouteTabAction />
      </RouteTabs>
    )
  )
}
