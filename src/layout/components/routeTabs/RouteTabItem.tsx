import type { MouseEvent } from 'react'
import type { RouteTabView } from '@/features/routeTabs'
import { XIcon } from 'lucide-react'
import { memo } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouteTabListContext } from './hooks'

interface RouteTabItemProps {
  tabItem: RouteTabView
  onClick?: (tabItem: RouteTabView) => void
  onClose?: (path: RouteTabView) => void
}

function RouteTabItem({ tabItem, onClick, onClose }: RouteTabItemProps) {
  const navigation = useNavigate()

  const { onChange, activeTabRef } = useRouteTabListContext()

  const { title, path, active } = tabItem

  const handleTabClick = () => {
    if (!active) {
      navigation(path)
    }
    navigation(path)
    onClick?.(tabItem)
    onChange?.({ type: 'select', tabItem })
  }
  const handleCloseClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // 阻止事件冒泡，避免触发标签页切换
    onClose?.(tabItem)
    onChange?.({ type: 'remove', tabItem })
  }

  return (
    <div
      className={cn(
        'box-border h-full flex flex-row justify-center items-center  border border-foreground/20 rounded-lg cursor-pointer',
        'hover:bg-primary/10',
        { 'bg-primary/20! text-primary! font-bold! border-0!': active },
      )}
      ref={tabItem.active ? activeTabRef : null}
      onClick={handleTabClick}
    >
      <span className={cn('p-2 flex items-center text-xs')}>{title}</span>
      {tabItem.path !== '/home/index' && (
        <Button variant="ghost" className="size-6 rounded-full hover:bg-foreground/10" onClick={handleCloseClick} aria-label={`Close ${title}`}>
          <XIcon size={8} />
        </Button>
      )}
    </div>
  )
}

export default memo(RouteTabItem)
