export interface RouteTab {
  title: string
  path: string
  active?: boolean
}

export interface ChangeEvent {
  type: 'select' | 'remove'
  tabItem: RouteTab
}
