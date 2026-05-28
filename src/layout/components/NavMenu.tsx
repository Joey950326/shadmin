import type { MenuItem } from './MenuItem'
import { EllipsisIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

interface NavMenuProps {
  menuItems: MenuItem[]
  className?: string
}

export default function NavMenu({ menuItems, className }: NavMenuProps) {
  const { t } = useTranslation()

  const [visibleItems, setVisibleItems] = useState<MenuItem[]>([])
  const [hiddenItems, setHiddenItems] = useState<MenuItem[]>([])

  const containerRef = useRef<HTMLDivElement>(null)

  // 检测溢出并计算“更多”菜单
  useEffect(() => {
    const calculateVisibleItems = () => {
      if (containerRef.current) {
        // console.log('Container width:', containerRef.current.offsetWidth)

        const containerWidth = containerRef.current.offsetWidth - 50 // 留出“更多”按钮空间
        let totalWidth = 0
        const visible: MenuItem[] = []
        const hidden: MenuItem[] = []

        menuItems.forEach((item: MenuItem) => {
          // 简单估算宽度（实际项目中可更精确测量）
          const estimatedWidth = (item.meta?.title?.length || 0) * 20 + 20 // 字符数 * 字体宽度 + padding

          if (totalWidth + estimatedWidth < containerWidth) {
            visible.push(item)
            totalWidth += estimatedWidth
          }
          else {
            hidden.push(item)
          }
        })
        // console.log('totalWidth:', totalWidth, 'visible:', visible, 'hidden:', hidden)

        setVisibleItems(visible)
        setHiddenItems(hidden)
      }
    }

    calculateVisibleItems()
    window.addEventListener('resize', calculateVisibleItems)

    return () => window.removeEventListener('resize', calculateVisibleItems)
  }, [t, menuItems])

  return (
    <div className={cn('size-full', className)} ref={containerRef}>
      <NavigationMenu viewport={false} className="size-full">
        <NavigationMenuList className="size-full ">
          {visibleItems.map(item => (
            <NavigationMenuItem key={item.name}>
              {
                item.children
                  ? (
                      <>
                        <NavigationMenuTrigger>{item.meta?.title}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul>
                            {item.children.map((child: MenuItem) => (
                              <NavigationMenuLink key={child.name} asChild>
                                <NavLink
                                  to={child.path}
                                >
                                  {child.meta?.title}
                                </NavLink>
                              </NavigationMenuLink>
                            ))}
                          </ul>
                          <NavigationMenuItem>
                            <NavigationMenuTrigger>{item.meta?.title}</NavigationMenuTrigger>
                            <NavigationMenuContent>
                              <ul>
                                {item.children.map((child: MenuItem) => (
                                  <NavigationMenuLink key={child.name} asChild>
                                    <NavLink
                                      to={child.path}
                                    >
                                      {child.meta?.title}
                                    </NavLink>
                                  </NavigationMenuLink>
                                ))}
                              </ul>
                            </NavigationMenuContent>
                          </NavigationMenuItem>
                        </NavigationMenuContent>
                      </>
                    )
                  : (
                      <NavigationMenuLink asChild>
                        <NavLink to={item.path} className="font-medium text-nowrap">
                          {item.meta?.title}
                        </NavLink>
                      </NavigationMenuLink>
                    )
              }

            </NavigationMenuItem>
          ),
          )}
          { hiddenItems.length > 0 && (
            <NavigationMenuItem key="more">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <EllipsisIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onCloseAutoFocus={e => e.preventDefault()}>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
        <NavigationMenuIndicator />

      </NavigationMenu>
    </div>

  )
}
