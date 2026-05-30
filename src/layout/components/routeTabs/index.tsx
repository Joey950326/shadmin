import type { MenuItem } from '../MenuItem'
import type { ChangeEvent, RouteTab } from './types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
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
  const location = useLocation()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const timersRef = useRef<number[]>([])

  const cleanUptimers = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current = []
  }, [])

  const menuData: MenuItem[] = useMemo(() => [
    { name: 'home', path: '/home/index', meta: { icon: 'home', title: t('menu:home') } },
    { name: 'dataScreen', path: '/dataScreen', meta: { icon: 'data-screen', title: t('menu:dataScreen') } },
    {
      name: 'proTable',
      path: '#',
      meta: { icon: 'table', title: t('menu:proTable') },
      children: [
        { name: 'treeTable', path: '/proTable/treeFilter', meta: { title: t('menu:treeTable') } },
        { name: 'filterTable', path: '/proTable/selectFilter', meta: { title: t('menu:filterTable') } },
      ],
    },
    {
      name: 'rightManage',
      path: '#',
      meta: { icon: 'right-manage', title: t('menu:rightManage') },
      children: [
        { name: 'treeTable', path: '/proTable/treeFilter', meta: { title: t('menu:treeTable') } },
        { name: 'filterTable', path: '/proTable/selectFilter', meta: { title: t('menu:filterTable') } },
      ],
    },
    {
      name: 'commonComponent',
      path: '#',
      meta: { icon: 'common-component', title: t('menu:commonComponent') },
      children: [
        { name: 'treeTable', path: '/commonComponent/fileUpload', meta: { title: t('menu:fileUpload') } },
        { name: 'filterTable', path: '/commonComponent/svgIcons', meta: { title: t('menu:svgIcons') } },
      ],
    },
    {
      name: 'dashboard',
      path: '#',
      meta: { icon: 'dashboard', title: t('menu:dashboard') },
      children: [
        { name: 'data-visualization', path: '/dashboard/dataVisualization', meta: { title: t('menu:dataVisualization') } },
      ],
    },

    {
      name: 'form',
      path: '#',
      meta: { icon: 'form', title: t('menu:commonForm') },
      children: [
        { name: 'basic-form', path: '/form/basicForm', meta: { title: t('menu:basicForm') } },
      ],
    },

    {
      name: 'chart',
      path: '#',
      meta: { icon: 'chart', title: t('menu:commonChart') },
      children: [
        { name: 'basic-chart', path: '/chart/basicChart', meta: { title: t('menu:basicChart') } },
      ],
    },

    {
      name: 'menuCollapse',
      path: '#',
      meta: { icon: 'menu-collapse', title: t('menu:menuCollapse') },
      children: [
        { name: 'subMenu1', path: '/menuCollapse/subMenu1', meta: { title: t('menu:subMenu1') } },
        { name: 'subMenu2', path: '/menuCollapse/subMenu2', meta: { title: t('menu:subMenu2') }, children: [
          { name: 'subMenu2-1', path: '/menuCollapse/subMenu2/subMenu1', meta: { title: t('menu:subMenu2-1') } },
          { name: 'subMenu2-2', path: '/menuCollapse/subMenu2/subMenu2', meta: { title: t('menu:subMenu2-2') } },
        ] },
        { name: 'subMenu3', path: '/menuCollapse/subMenu3', meta: { title: t('menu:subMenu3') } },

      ],
    },

    {
      name: 'systemManage',
      path: '#',
      meta: { icon: 'system-manage', title: t('menu:systemManage') },
      children: [
        { name: 'accountManage', path: '/systemManage/accountManage', meta: { title: t('menu:accountManage') } },
        { name: 'roleManage', path: '/systemManage/roleManage', meta: { title: t('menu:roleManage') } },
        { name: 'menuManage', path: '/systemManage/menuManage', meta: { title: t('menu:menuManage') } },
      ],
    },
    {
      name: 'externalLink',
      path: '#',
      meta: { icon: 'extral-link', title: t('menu:externalLink') },
      children: [
        {
          name: 'githubLink',
          path: '/extralLink/github',
          meta: { icon: 'extral-link', title: t('menu:githubLink') },
        },
        { name: 'giteeLink', path: '/extralLink/gitee', meta: { icon: 'extral-link', title: t('menu:giteeLink') } },
        { name: 'documentLink', path: '/extralLink/document', meta: { icon: 'extral-link', title: t('menu:documentLink') } },
      ],
    },
  ], [t])

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
    tabsData.length > 0 && (
      <RouteTabs
        className="h-11 w-full border-b-foreground/10"
        onChange={handleTabsChange}
        onFreshTab={handleFreshTab}
        onCloseCurrentTab={handleCloseCurrentTab}
        onCloseOtherTab={handleCloseOtherTab}
        onCloseAllTab={handleCloseAllTab}
      >
        <RouteTabList className="h-full flex items-center pt-1 px-2 shadow-xl">
          {tabsData.map(tab => (
            <RouteTabItem key={tab.path} tabItem={tab} />
          ))}
        </RouteTabList>
        <RouteTabAction />
      </RouteTabs>
    )
  )
}
