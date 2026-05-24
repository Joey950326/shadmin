import type { RouteObject } from 'react-router'

export interface RouteHandle {
  title?: string
}

export type AppRouteObject = Omit<RouteObject, 'children' | 'handle'> & {
  children?: AppRouteObject[]
  handle?: RouteHandle
}
