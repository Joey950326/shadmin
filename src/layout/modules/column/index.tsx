import type { MenuItem } from '@/layout/components/MenuItem'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarProvider } from '@/components/ui/sidebar'
import useMenu from '@/hooks/useMenu'
import ChildrenRoute from '@/layout/components/ChildrenRoute'
import Header from '@/layout/components/Header'
import Logo from '@/layout/components/Logo'
import RouteTabs from '@/layout/components/routeTabs'
import Sider from '@/layout/components/Sider'
import { getMenuIcon } from '@/layout/shared'

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
      className={`box-border w-full flex flex-col items-center p-2 gap-1 cursor-pointer hover:bg-primary/10 rounded-xl ${props.active ? 'bg-primary/10' : ''}`}
      onClick={handleClick}
    >
      {/* <MapIcon /> */}
      {getMenuIcon(props?.meta?.icon || '')}
      <span className="text-xs text-center text-nowrap">{props.meta?.title}</span>
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
  const navigate = useNavigate()
  const location = useLocation()

  const { menuData } = useMenu()
  const [activeName, setActiveName] = useState<string>(() => findActiveFirstMenuItem(location.pathname, menuData)?.name || '')
  const subMenuItems = useMemo(() => getSubMenuItems(activeName, menuData), [activeName, menuData])
  const sidebarVisible = useMemo(() => subMenuItems.length > 0, [subMenuItems.length])
  const handleFirstMenuClick = (item: MenuItem) => {
    setActiveName(item.name)
    navigate(item.path)
  }

  // console.log('subMenuITems:', subMenuItems)

  return (
    <SidebarProvider>

      <div className="w-full h-screen overflow-hidden bg-background flex flex-row">
        {/* 一级菜单项 */}
        <div className="w-16 min-w-16 h-full shrink-0 flex flex-col items-center border-r">
          <div className="w-full h-16 flex items-center justify-center">
            <Logo showTitle={false} className="size-8 box-border" />
          </div>
          <ScrollArea className="size-full py-2 overflow-y-auto">
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
          <div className="flex-1 h-full bg-primary/10 flex flex-col size-full overflow-hidden">
            <Header className="shrink-0" />
            <RouteTabs />
            <main className="flex-1 overflow-auto p-2">
              <ChildrenRoute />
            </main>
          </div>

        </div>
      </div>
    </SidebarProvider>
  )
}
