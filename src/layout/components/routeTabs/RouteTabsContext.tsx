import type { RefObject } from 'react'
import type { ChangeEvent, RouteTab } from './types'
import { createContext } from 'react'

export interface RouteTabContextValue {
  activeTabRef?: RefObject<HTMLDivElement | null>
  scrollContainerRef?: RefObject<HTMLDivElement | null>
  activeTabItem?: RouteTab
  onChange?: (e: ChangeEvent) => void
  onCloseAllTab?: () => void
  onCloseOtherTab?: (currentTab?: RouteTab) => void
  onCloseCurrentTab?: (currentTab?: RouteTab) => void
  onFreshTab?: (currentTab?: RouteTab) => void
}

const RouteTabsContext = createContext<RouteTabContextValue>({
})

export default RouteTabsContext
