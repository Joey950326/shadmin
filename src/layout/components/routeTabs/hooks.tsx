import { use } from 'react'
import RouteTabsContext from './RouteTabsContext'

export function useRouteTabListContext() {
  const context = use(RouteTabsContext)
  if (!context) {
    throw new Error('useRouteTabListContext must be used within a RouteTabsContext.Provider')
  }
  return context
}
