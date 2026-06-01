import type { MenuItem } from '@/layout/components/MenuItem'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function useMenu() {
  const { t } = useTranslation()
  const menuData = useMemo<MenuItem[]>(() => [
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

  return { menuData }
}
