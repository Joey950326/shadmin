import type { MenuItem } from '../MenuItem'
import type { ChangeEvent, RouteTab } from './types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

  const [tabsData, setTabsData] = useState<RouteTab[]>(initialTabsData)

  const activeTabItem = useMemo(() => {
    return tabsData.find(tab => tab.active)
  }, [tabsData])

  const handleTabsChange = useCallback((e: ChangeEvent) => {
    if (e.type === 'select') {
      setTabsData(prev => prev.map(tabItem => ({
        ...tabItem,
        active: tabItem.path === e.tabItem.path,
      })))
    }
    else if (e.type === 'remove') {
      let nextPath = ''
      setTabsData((prev) => {
        if (e.tabItem.active) {
          const currentIndex = prev.findIndex(tab => tab.path === e.tabItem.path)
          const nextTab = prev[currentIndex + 1] || prev[currentIndex - 1]
          nextPath = nextTab?.path || '/home/index'
        }
        return prev.filter(tab => tab.path !== e.tabItem.path).map(tab => ({ ...tab, active: tab.path === nextPath }))
      })
      if (nextPath) {
        timersRef.current.push(
          setTimeout(() => {
            navigate(nextPath)
          }, 200),
        )
      }
    }
  }, [navigate])

  useEffect(() => {
    // 设置标签页数据，保持与路由同步
    setTabsData((prev) => {
      const inTabsData = prev.some(tabItem => tabItem.path === location.pathname)
      const newTabsData = prev.map(tabItem => ({
        ...tabItem,
        active: tabItem.path === location.pathname,
      }))
      if (!inTabsData) {
        return [...newTabsData, { title: getActiveMenuItem(location.pathname, menuData)?.meta?.title || '未知页面', path: location.pathname, active: true }]
      }
      return newTabsData
    })
    return () => {
    // 清理定时器，防止内存泄漏
      cleanUptimers()
    }
  }, [location.pathname, menuData])

  useEffect(() => {
    dispatch(updateTabsData(tabsData))
  }, [tabsData, dispatch])

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
      setTabsData(prev => prev.filter(tab => tab.path === activeTabItem.path || tab.path === '/home/index'))
    }
  }, [activeTabItem])

  /** 关闭全部 */
  const handleCloseAllTab = useCallback(() => {
    setTabsData(prev => prev.filter(tab => tab.path === '/home/index'))
    timersRef.current.push(
      setTimeout(() => {
        navigate('/home/index')
      }, 200),
    )
  }, [navigate])

  return (
    showTabs && tabsData.length > 0 && (
      <RouteTabs
        className=" h-11 w-full border-b-foreground/10 bg-background"
        onChange={handleTabsChange}
        onFreshTab={handleFreshTab}
        onCloseCurrentTab={handleCloseCurrentTab}
        onCloseOtherTab={handleCloseOtherTab}
        onCloseAllTab={handleCloseAllTab}
      >
        <RouteTabList className="h-full flex-1 flex items-center pt-1 px-2 shadow-xl">
          {tabsData.map(tab => (
            <RouteTabItem key={tab.path} tabItem={tab} />
          ))}
        </RouteTabList>
        <RouteTabAction />
      </RouteTabs>
    )
  )
}
