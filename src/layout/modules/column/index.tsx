import type { MenuItem } from '@/layout/components/MenuItem'
import { MapIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useOutlet } from 'react-router'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarProvider } from '@/components/ui/sidebar'
import AnimateMotionProvider from '@/features/motion/AnimateMotionProvider'
import Header from '@/layout/components/Header'
import Logo from '@/layout/components/Logo'
import Sider from '@/layout/components/Sider'

interface FirstMenuItemProps extends MenuItem {
  onClick: (name: string) => void
  active?: boolean
}

function getSubMenuItems(name: string, menuData: MenuItem[]): MenuItem[] {
  const subMenuItems = menuData.find(item => item.name === name)?.children || []
  return subMenuItems
}

function FirstMenuItem(props: FirstMenuItemProps) {
//   const { setOpen, open } = useSidebar()
  const handleClick = () => {
    // setOpen(!open)
    props.onClick(props.name)
  }
  return (
    <div
      className={`box-border w-full flex flex-col items-center p-2 cursor-pointer hover:bg-primary/10 rounded-xl ${props.active ? 'bg-primary/10' : ''}`}
      onClick={handleClick}
    >
      <MapIcon />
      <span className="text-xs text-center">{props.meta?.title}</span>
    </div>
  )
}

function findActiveFirstMenuItem(path: string, menuData: MenuItem[]): MenuItem | null {
  for (const item of menuData) {
    if (item.path === path) {
      return item
    }
    if (item.children) {
      const found = findActiveFirstMenuItem(path, item.children)
      if (found) {
        return item
      }
    }
  }
  return null
}

export default function ColumnLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const outletElement = useOutlet()

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
  const [activeName, setActiveName] = useState<string>(() => findActiveFirstMenuItem(location.pathname, menuData)?.name || '')
  const [subMenuItems, setSubMenuItems] = useState<MenuItem[]>(() => getSubMenuItems(activeName, menuData))
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(activeName !== '' && subMenuItems.length > 0)

  const handleFirstMenuClick = (item: MenuItem) => {
    const subMenuItems = getSubMenuItems(item.name, menuData)

    setSubMenuItems(subMenuItems)
    setActiveName(item.name)
    setSidebarVisible(subMenuItems.length > 0)
    navigate(item.path)
    // console.log('点击了一级菜单项:', item.name, '对应的二级菜单项:', subMenuItems)
  }

  return (
    <SidebarProvider>

      <div className="w-full h-screen overflow-hidden bg-background flex flex-row">
        {/* 一级菜单项 */}
        <div className="w-16 min-w-16 h-full shrink-0 flex flex-col items-center  border-r">
          <div className="w-full h-16 flex items-center justify-center">
            <Logo showTitle={false} className="size-8 box-border" />

          </div>
          <ScrollArea className="w-full py-2 max-h-[calc(100vh-4rem)]">
            {menuData.map(item => (
              <FirstMenuItem
                active={activeName === item.name}
                key={item.name}
                {...item}
                onClick={() => handleFirstMenuClick(item)}
              />
            ))}
          </ScrollArea>

        </div>
        {/* 主体内容 */}
        <div className="flex-1 h-full overflow-hidden flex flex-row">

          {/* 二级菜单项目 */}
          {sidebarVisible && <Sider className="ml-16" menuItems={subMenuItems} showLogo={false} />}

          {/* 主要内容区 */}
          <div className="flex-1 h-full bg-primary/10 flex flex-col size-full">
            <Header className="shrink-0" />
            <main className="flex-1 overflow-auto p-6">
              <AnimateMotionProvider>
                {outletElement}
              </AnimateMotionProvider>
            </main>
          </div>

        </div>
      </div>
    </SidebarProvider>
  )
}
