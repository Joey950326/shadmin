import type { MenuItem } from '../MenuItem'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router'
import { Button } from '@/components/ui/button'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

interface NavigationFlyoutMenuItemProps {
  item: MenuItem
  activeId?: string
  onSelect: (item: MenuItem) => void
}

export default function NavigationFlyoutMenuItem({ item, activeId, onSelect }: NavigationFlyoutMenuItemProps) {
  const [openChildName, setOpenChildName] = useState('')
  const hasChildren = !!item.children?.length
  const isActive = activeId === item.name

  if (!hasChildren) {
    return (
      <NavigationMenuLink
        asChild
        active={isActive}
        className={cn(isActive && 'bg-accent text-accent-foreground')}
      >
        <NavLink
          to={item.path}
          className="block truncate whitespace-nowrap"
          onClick={() => onSelect(item)}
        >
          {item.meta?.title}
        </NavLink>
      </NavigationMenuLink>
    )
  }

  return (
    <div className="relative" onPointerLeave={() => setOpenChildName('')}>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          'h-auto w-full justify-start px-3 py-3 text-sm font-medium rounded-xl',
          openChildName === item.name && 'bg-accent text-accent-foreground',
        )}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpenChildName(current => current === item.name ? '' : item.name)
        }}
        onPointerEnter={() => setOpenChildName(item.name)}
      >
        <span className="truncate whitespace-nowrap">{item.meta?.title}</span>
        <ChevronRight className="ml-auto size-4 shrink-0" />
      </Button>

      {openChildName === item.name && (
        <div className="absolute top-0 left-full z-50 w-56 rounded-3xl bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10">
          {item.children!.map(child => (
            <NavigationFlyoutMenuItem
              key={child.name}
              item={child}
              activeId={activeId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
