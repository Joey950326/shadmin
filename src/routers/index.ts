import { createBrowserRouter } from 'react-router'
import { App } from '@/App.tsx'
import HomePage from '@/pages/home/index.tsx'
import staticRoutes from './modules/staticRoutes.ts'

const router = createBrowserRouter([{
  path: '/',
  Component: App,
  children: [
    {
      index: true,
      Component: HomePage,
    },
    ...staticRoutes,
  ],
}])

export default router
