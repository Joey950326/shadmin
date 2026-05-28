import type { JSX } from 'react'
import type { MenuItem } from '../MenuItem'
import { MoreHorizontal } from 'lucide-react'
import { NavLink } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface MoreMenuProps {
  activeId?: string
  items: MenuItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: MenuItem, topMenuName: string) => void
}

function MoreMenuItem({
  activeId,
  item,
  topMenuName,
  onSelect,
}: {
  activeId?: string
  item: MenuItem
  topMenuName: string
  onSelect: (item: MenuItem, topMenuName: string) => void
}): JSX.Element {
  const hasChildren = !!item.children?.length
  const isActive = activeId === item.name

  if (hasChildren) {
    return (
      <DropdownMenuSub key={item.name}>
        <DropdownMenuSubTrigger className="flex items-center gap-2">
          <span>{item.meta?.title}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {item.children!.map(child => (
            <MoreMenuItem
              key={child.name}
              activeId={activeId}
              item={child}
              topMenuName={topMenuName}
              onSelect={onSelect}
            />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )
  }

  return (
    <DropdownMenuItem
      key={item.name}
      asChild
      className={cn(isActive && 'bg-accent text-accent-foreground')}
    >
      <NavLink
        to={item.path}
        className="w-full truncate whitespace-nowrap"
        onClick={() => onSelect(item, topMenuName)}
      >
        {item.meta?.title}
      </NavLink>
    </DropdownMenuItem>
  )
}

export default function MoreMenu({ activeId, items, open, onOpenChange, onSelect }: MoreMenuProps) {
  if (items.length === 0)
    return null

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 flex h-9 shrink-0 items-center gap-1.5 px-3"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-60"
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <DropdownMenuLabel>更多菜单</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map(item => (
            <MoreMenuItem
              key={item.name}
              activeId={activeId}
              item={item}
              topMenuName={item.name}
              onSelect={onSelect}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
