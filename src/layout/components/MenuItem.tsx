import { ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { getMenuIcon } from '../shared'

interface ItemMeta {
  icon?: string
  isAffix?: boolean
  isFull?: boolean
  isHide?: boolean
  isKeepAlive?: boolean
  isLink?: string
  title: string
}

export interface MenuItem {
  name: string
  meta?: ItemMeta
  path: string
  children?: MenuItem[]
}

interface NavMenuItemProps {
  item: MenuItem
  level?: number
}

export default function NavMenuItem({ item, level = 0 }: NavMenuItemProps) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const isActive = item.path === location.pathname
  const hasChildren = item.children && item.children.length > 0
  const { open: siderOpen } = useSidebar()

  //   当前菜单没有子菜单
  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton asChild isActive={isActive}>
              <NavLink to={item.path || '#'} className={isActive ? 'bg-primary/20! hover:bg-primary/20! text-primary! font-bold!' : ''}>
                <span className="flex size-4 shrink-0 items-center justify-center">
                  {getMenuIcon(item?.meta?.icon || '')}
                </span>
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  {item?.meta?.title || item.name }
                </span>
              </NavLink>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right" className={!siderOpen ? 'opacity-100' : 'opacity-0'}>
            <p>{item?.meta?.title || item.name }</p>
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    )
  }

  //   当前菜单有子菜单
  return (
    <SidebarMenuItem>
      {/* TODO 添加toolTip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton onClick={() => setIsOpen(!isOpen)} isActive={isActive} className="cursor-pointer">
            <span className="flex size-4 shrink-0 items-center justify-center">
              {getMenuIcon(item?.meta?.icon || '')}
            </span>
            <span className="truncate group-data-[collapsible=icon]:hidden">
              {item?.meta?.title || item.name }
            </span>
            <ChevronRightIcon
              className={cn(
                'ml-auto h-4 w-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden',
                isOpen && 'rotate-90',
              )}
            />
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right" className={!siderOpen ? 'opacity-100' : 'opacity-0'}>
          <p>{item?.meta?.title || item.name }</p>
        </TooltipContent>
      </Tooltip>
      {/* {isOpen && ( */}
      <SidebarMenuSub className={cn('transition-all', isOpen ? 'block' : 'hidden', 'mr-0 px-0')}>
        {item.children!.map(child => (
          <NavMenuItem key={child.path} item={child} level={level + 1} />
        ))}
      </SidebarMenuSub>
      {/* )} */}

    </SidebarMenuItem>
  )
}
