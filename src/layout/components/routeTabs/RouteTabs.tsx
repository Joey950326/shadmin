import type { ReactNode, RefObject } from 'react'
import type { RouteTabContextValue } from './RouteTabsContext'
import type { RouteTab } from './types'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import RouteTabsContext from './RouteTabsContext'

interface RouteTabsProps extends RouteTabContextValue {
  children?: ReactNode
  className?: string
  activeTabRef?: RefObject<HTMLDivElement | null>
  scrollContainerRef?: RefObject<HTMLDivElement | null>
  activeTabItem?: RouteTab
}

export default function RouteTabs({ activeTabItem, children, className, activeTabRef, scrollContainerRef, onChange, onCloseAllTab, onCloseCurrentTab, onCloseOtherTab, onFreshTab }: RouteTabsProps) {
  const contextValue = useMemo(() => ({
    activeTabItem,
    activeTabRef,
    scrollContainerRef,
    onChange,
    onCloseAllTab,
    onCloseCurrentTab,
    onCloseOtherTab,
    onFreshTab,
  }), [activeTabItem, activeTabRef, onChange, onCloseAllTab, onCloseCurrentTab, onCloseOtherTab, onFreshTab, scrollContainerRef])

  return (
    <RouteTabsContext value={contextValue}>
      <div className={cn('box-border border-b bg-foreground/10 size-full overflow-hidden flex items-center', className)}>
        {children}
      </div>
    </RouteTabsContext>
  )
}
