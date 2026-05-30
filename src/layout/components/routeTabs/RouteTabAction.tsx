import { Grid2x2XIcon, LocateFixedIcon, MoreHorizontal, RotateCcwIcon, SquareXIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useRouteTabListContext } from './hooks'

interface RouteTabActionProps {
  className?: string
}

export default function RouteTabAction({ className }: RouteTabActionProps) {
  const { onFreshTab, onCloseCurrentTab, onCloseOtherTab, onCloseAllTab } = useRouteTabListContext()

  const handleFreshTab = () => {
    onFreshTab?.()
  }
  const handleCloseCurrentTab = () => {
    onCloseCurrentTab?.()
  }

  const handleCloseOtherTab = () => {
    onCloseOtherTab?.()
  }

  const handleCloseAllTab = () => {
    onCloseAllTab?.()
  }

  return (
    <div className={cn('flex items-center px-2 shrink-0', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onCloseAutoFocus={e => e.preventDefault()}>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={handleFreshTab} className="cursor-pointer">
              <RotateCcwIcon />
              刷新
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={handleCloseCurrentTab}
            >
              <LocateFixedIcon />
              关闭当前
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onSelect={handleCloseOtherTab}>
              <Grid2x2XIcon />
              关闭其他
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onSelect={handleCloseAllTab}>
              <SquareXIcon />
              关闭所有
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
