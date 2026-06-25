import type { MenuItem } from './MenuItem'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, useSidebar } from '@/components/ui/sidebar'
import useMenu from '@/hooks/useMenu'
import { cn } from '@/lib/utils'
import Logo from './Logo'
import NavMenu from './Menu'

interface SiderProps {
  className?: string
  menuItems?: MenuItem[]
  showLogo?: boolean
  showTitle?: boolean
  collapsible?: 'icon' | 'offcanvas' | 'none'
}

export default function Sider({ className, menuItems, showLogo = true, showTitle = true, collapsible = 'icon' }: SiderProps) {
  const { menuData } = useMenu()
  const { open } = useSidebar()

  return (
    <Sidebar collapsible={collapsible} className={cn('h-full', className)}>
      <SidebarHeader className={
        cn(
          'h-16 w-full flex flex-row items-center group-data-[collapsible=icon]:items-center',
          open ? '' : 'justify-center',
        )
      }
      >
        <Logo showTitle={showTitle} showLogo={showLogo} open={open} />
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <NavMenu items={menuItems || menuData} />
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
