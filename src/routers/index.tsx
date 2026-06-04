import { createBrowserRouter, Navigate } from 'react-router'
import { App } from '@/App.tsx'
import dynamicRoutes from './modules/dynamicRoutes.tsx'
import staticRoutes from './modules/staticRoutes.tsx'

const router = createBrowserRouter([{
  path: '/',
  Component: App,
  children: [
    {
      index: true,
      element: <Navigate to="home/index" replace />,
    },
    ...staticRoutes,
    ...dynamicRoutes,
  ],
}])

export default router
