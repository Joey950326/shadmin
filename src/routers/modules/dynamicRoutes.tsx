import type { AppRouteObject } from '../types'
import { Navigate } from 'react-router'
import AuthGate from '@/features/router/AuthGate'
import Expection404 from '@/pages/404/index.tsx'

const dynamicRoutes = [
  {
    path: '/',
    lazy: async () => {
      const Mod = (await import('@/layout/index')).default
      return { Component: () => <AuthGate><Mod /></AuthGate> }
    },
    children: [
      {
        path: 'home/index',
        lazy: async () => {
          const Component = (await import('@/pages/home/index.tsx')).default
          return { Component }
        },
        handle: { title: '首页' },

      },
      {
        path: 'proTable',
        handle: { title: '超级表格' },
        children: [
          {
            index: true,
            element: <Navigate to="treeFilter" replace />,
          },
          {
            path: 'treeFilter',
            lazy: async () => {
              const Component = (await import('@/pages/proTable/treeFilter/index.tsx')).default
              return { Component }
            },
            handle: { title: '树形筛选' },
          },
          {
            path: 'selectFilter',
            lazy: async () => {
              const Component = (await import('@/pages/proTable/selectFilter/index.tsx')).default
              return { Component }
            },
            handle: { title: '选择筛选' },
          },
        ],
      },
      {
        path: 'dashboard',
        handle: { title: '仪表盘' },
        children: [
          {
            path: 'dataVisualization',
            lazy: async () => {
              const Component = (await import('@/pages/dashboard/dataVisualization/index.tsx')).default
              return { Component }
            },
            handle: { title: '数据可视化' },
          },
        ],
      },

      {
        path: '*',
        Component: Expection404,
        handle: { title: '页面未找到' },
      },
    ],
  },
] satisfies AppRouteObject[]

export default dynamicRoutes
