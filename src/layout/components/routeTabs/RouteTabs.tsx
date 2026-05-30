import type { ReactNode } from 'react'
import type { RouteTabContextValue } from './RouteTabsContext'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import RouteTabsContext from './RouteTabsContext'

interface RouteTabsProps extends RouteTabContextValue {
  children?: ReactNode
  className?: string
}

export default function RouteTabs({ children, className, onChange, onCloseAllTab, onCloseCurrentTab, onCloseOtherTab, onFreshTab }: RouteTabsProps) {
  const contextValue = useMemo(() => ({
    onChange,
    onCloseAllTab,
    onCloseCurrentTab,
    onCloseOtherTab,
    onFreshTab,
  }), [onChange, onCloseAllTab, onCloseCurrentTab, onCloseOtherTab, onFreshTab])

  return (
    <RouteTabsContext value={contextValue}>
      <div className={cn('box-border border-b bg-foreground/10 size-full overflow-hidden flex items-center', className)}>
        {children}
      </div>
    </RouteTabsContext>
  )
}
