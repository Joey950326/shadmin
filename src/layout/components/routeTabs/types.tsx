import type { RouteTabView } from '@/features/routeTabs'

export type RouteTab = RouteTabView

export interface ChangeEvent {
  type: 'select' | 'remove'
  tabItem: RouteTabView
}
