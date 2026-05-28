import type { MenuItem } from '../MenuItem'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router'
import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import MoreMenu from './MoreMenu'
import NavigationFlyoutMenuItem from './NavigationFlyoutMenuItem'

interface TopNavBarProps {
  menuItems: MenuItem[]
  onMenuClick: (item: MenuItem) => void
  activeId?: string
  className?: string
}

function findTopMenuName(menuItems: MenuItem[], id?: string): string | null {
  if (!id)
    return null

  for (const item of menuItems) {
    if (item.name === id)
      return item.name

    if (item.children?.some(child => findTopMenuName([child], id)))
      return item.name
  }

  return null
}

export default function TopNavBar({
  menuItems,
  onMenuClick,
  activeId,
  className,
}: TopNavBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)
  const measurementRef = useRef<HTMLDivElement>(null) // 新增：隐藏测量容器

  const [visibleCount, setVisibleCount] = useState(0)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const activeTopMenuName = useMemo(() => findTopMenuName(menuItems, activeId), [activeId, menuItems])
  const [selectedMenuName, setSelectedMenuName] = useState<string | null>(activeTopMenuName)
  const [openMenuName, setOpenMenuName] = useState('')

  useEffect(() => {
    if (activeTopMenuName)
      setSelectedMenuName(activeTopMenuName)
  }, [activeTopMenuName])

  // 使用 useMemo 缓存计算结果，减少重复计算
  const { visibleItems, moreItems } = useMemo(() => {
    return {
      visibleItems: menuItems.slice(0, visibleCount),
      moreItems: menuItems.slice(visibleCount),
    }
  }, [menuItems, visibleCount])

  // 优化的宽度计算（增加节流思想，通过 requestAnimationFrame 优化）
  const calculateVisibleItems = useCallback(() => {
    if (!containerRef.current || !itemsRef.current || !measurementRef.current)
      return

    const containerWidth = containerRef.current.clientWidth - 50 // 更多按钮 + 安全边距
    const itemElements = Array.from(measurementRef.current.children) as HTMLElement[]

    let totalWidth = 0
    let count = 0

    for (const el of itemElements) {
      const itemWidth = el.offsetWidth // 间距
      if (totalWidth + itemWidth > containerWidth)
        break
      totalWidth += itemWidth
      count++
    }

    setVisibleCount(Math.max(1, count))
  }, [])

  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculateVisibleItems)
    })

    const container = containerRef.current
    if (container)
      observer.observe(container)

    // 初始计算
    const timer = setTimeout(calculateVisibleItems, 30)

    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [calculateVisibleItems, menuItems, itemsRef])

  const handleClickItem = (item: MenuItem) => {
    onMenuClick(item)
    setIsMoreOpen(false) // 关闭更多菜单
    setSelectedMenuName(item.name) // 设置当前激活的一级菜单项
    setOpenMenuName(item.children?.length ? item.name : '')
  }

  const handleTopMenuTrigger = (item: MenuItem) => {
    if (!item.children?.length)
      return

    onMenuClick(item)
    setIsMoreOpen(false)
    setSelectedMenuName(item.name)
    setOpenMenuName(item.name)
  }

  return (
    <nav
      ref={containerRef}
      className={cn(
        'relative size-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex items-center px-2',
        className,
      )}
    >
      <div ref={itemsRef} className="flex h-full min-w-0 items-center ">
        <NavigationMenu
          viewport={false}
          value={openMenuName}
          onValueChange={(value) => {
            setOpenMenuName(value)
            if (value)
              setIsMoreOpen(false)
          }}
          className="h-full w-full min-w-0 max-w-none justify-start"
        >
          <NavigationMenuList className="h-full w-full min-w-0 flex-nowrap justify-start">
            {visibleItems.map((item) => {
              const hasChildren = !!item.children?.length
              const isActive = selectedMenuName === item.name

              if (!hasChildren) {
                return (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink
                      asChild
                      active={isActive}
                      className={cn(
                        'h-full px-4 py-2 font-medium whitespace-nowrap',
                        isActive && 'bg-accent text-accent-foreground',
                      )}
                    >
                      <NavLink to={item.path} onClick={() => handleClickItem(item)}>
                        <span className="truncate">{item.meta?.title}</span>
                      </NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              }

              return (
                <NavigationMenuItem key={item.name} value={item.name}>
                  <NavigationMenuTrigger
                    className={cn(
                      'h-full max-w-48 rounded-3xl px-4 py-2',
                      isActive && 'bg-accent text-accent-foreground',
                    )}
                    onPointerDown={() => handleTopMenuTrigger(item)}
                  >
                    <span className="truncate whitespace-nowrap">{item.meta?.title}</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="w-60 overflow-visible group-data-[viewport=false]/navigation-menu:overflow-visible">
                    <div className="w-60 p-1.5">
                      { item.children!.map(child => (
                        <NavigationFlyoutMenuItem
                          key={child.name}
                          item={child}
                          activeId={activeId}
                          onSelect={(selectedItem) => {
                            onMenuClick(selectedItem)
                            setSelectedMenuName(item.name)
                            setOpenMenuName('')
                            setIsMoreOpen(false)
                          }}
                        />
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* 隐藏的测量容器 - 渲染所有菜单项用于宽度计算 */}
      <div
        ref={measurementRef}
        className="fixed -left-10000 -top-10000 overflow-hidden opacity-0 pointer-events-none invisible flex items-center"
        aria-hidden="true"
      >
        {menuItems.map((item) => {
          const hasChildren = !!item.children?.length

          return (
            <Button
              key={item.name}
              variant="ghost"
              className="fixed -left-1000 -top-1000 overflow-hidden opacity-0 pointer-events-none invisible flex h-full items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap"
            >
              <span>{item.meta?.title}</span>
              {hasChildren && <span className="size-4" />}
            </Button>
          )
        })}

      </div>
      {/* 更多菜单 */}
      <MoreMenu
        activeId={activeId}
        items={moreItems}
        open={isMoreOpen}
        onOpenChange={(open) => {
          setIsMoreOpen(open)
          if (open)
            setOpenMenuName('')
        }}
        onSelect={(item, topMenuName) => {
          onMenuClick(item)
          setSelectedMenuName(topMenuName)
          setOpenMenuName('')
          setIsMoreOpen(false)
        }}
      />
    </nav>
  )
}
