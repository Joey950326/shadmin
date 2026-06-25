import type { MenuItem } from '@/layout/components/MenuItem'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

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
  const { t } = useTranslation()
  const location = useLocation()
  const menuData = useMemo<MenuItem[]>(() => [
    { name: 'home', path: '/home/index', meta: { icon: 'home', title: t('menu:home') } },
    {
      name: 'dashboard',
      path: '#',
      meta: { icon: 'dashboard', title: t('menu:dashboard.title') },
      children: [
        { name: 'dataVisualization', path: '/dashboard/dataVisualization', meta: { title: t('menu:dashboard.dataVisualization'), icon: 'dataVisualization' } },
      ],
    },
    // 表格
    {
      name: 'proTable',
      path: '#',
      meta: { icon: 'table', title: t('menu:table.title') },
      children: [
        { name: 'basicTable', path: '/proTable/basicTable', meta: { title: t('menu:table.basicTable'), icon: 'basicTable' } },
        { name: 'complexTable', path: '/proTable/complexTable', meta: { title: t('menu:table.complexTable'), icon: 'complexTable' } },
        { name: 'treeTable', path: '/proTable/treeFilter', meta: { title: t('menu:table.treeTable'), icon: 'treeTable' } },
      ],
    },
    // 表单
    {
      name: 'form',
      path: '#',
      meta: { icon: 'form', title: t('menu:commonForm') },
      children: [
        { name: 'basic-form', path: '/form/basicForm', meta: { title: t('menu:form.basicForm'), icon: 'basicForm' } },
        { name: 'complex-form', path: '/form/complexForm', meta: { title: t('menu:form.complexForm'), icon: 'complexForm' } },
        { name: 'dynamic-form', path: '/form/dynamicForm', meta: { title: t('menu:form.dynamicForm'), icon: 'dynamicForm' } },
      ],
    },
    // 图表
    {
      name: 'chart',
      path: '#',
      meta: { icon: 'chart', title: t('menu:commonChart') },
      children: [
        { name: 'bar-chart', path: '/chart/barChart', meta: { icon: 'barChart', title: t('menu:chart.barChart') } },
        { name: 'line-chart', path: '/chart/lineChart', meta: { icon: 'lineChart', title: t('menu:chart.lineChart') } },
        { name: 'area-chart', path: '/chart/areaChart', meta: { icon: 'areaChart', title: t('menu:chart.areaChart') } },
        { name: 'pie-chart', path: '/chart/pieChart', meta: { icon: 'pieChart', title: t('menu:chart.pieChart') } },
        { name: 'radar-chart', path: '/chart/radarChart', meta: { icon: 'radarChart', title: t('menu:chart.radarChart') } },
        { name: 'radial-chart', path: '/chart/radialChart', meta: { icon: 'radialChart', title: t('menu:chart.radialChart') } },
      ],
    },
    // 权限管理
    {
      name: 'rightManage',
      path: '#',
      meta: { icon: 'right-manage', title: t('menu:rightManage') },
      children: [
        { name: 'treeTable', path: '/proTable/treeFilter', meta: { title: t('menu:treeTable') } },
        { name: 'filterTable', path: '/proTable/selectFilter', meta: { title: t('menu:filterTable') } },
      ],
    },
    // 常用组件
    {
      name: 'commonComponent',
      path: '#',
      meta: { icon: 'common-component', title: t('menu:commonComponent') },
      children: [
        { name: 'treeTable', path: '/commonComponent/fileUpload', meta: { title: t('menu:fileUpload') } },
        { name: 'filterTable', path: '/commonComponent/svgIcons', meta: { title: t('menu:svgIcons') } },
      ],
    },
    // 嵌套菜单
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
    // 系统管理
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
    { name: 'dataScreen', path: '/dataScreen', meta: { icon: 'data-screen', title: t('menu:dataScreen') } },

  ], [t])

  const currentMenu = useMemo(() => {
    return findActiveMenu(menuData, location.pathname)
  }, [location.pathname, menuData])

  return { menuData, currentMenu }
}
