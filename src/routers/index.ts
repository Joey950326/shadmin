import { createBrowserRouter } from 'react-router'
import { App } from '@/App.tsx'
import HomePage from '@/pages/home/index.tsx'
import dynamicRoutes from './modules/dynamicRoutes.tsx'
import staticRoutes from './modules/staticRoutes.tsx'

const router = createBrowserRouter([{
  path: '/',
  Component: App,
  children: [
    {
      index: true,
      Component: HomePage,
    },
    ...staticRoutes,
    ...dynamicRoutes,
  ],
}])

export default router
