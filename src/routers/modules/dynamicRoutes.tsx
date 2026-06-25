import type { AppRouteObject } from '../types'
import { Navigate } from 'react-router'
// route titles use translation keys where needed; translate at render time
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
      // 表格
      {
        path: 'proTable',
        handle: { title: '超级表格' },
        children: [
          {
            index: true,
            element: <Navigate to="basicTable" replace />,
          },
          {
            path: 'basicTable',
            lazy: async () => {
              const Component = (await import('@/pages/proTable/basicTable/index.tsx')).default
              return { Component }
            },
            handle: { title: 'menu:table.basicTable' },
          },
          {
            path: 'complexTable',
            lazy: async () => {
              const Component = (await import('@/pages/proTable/complexTable/index.tsx')).default
              return { Component }
            },
            handle: { title: 'menu:table.complexTable' },
          },
          {
            path: 'treeFilter',
            lazy: async () => {
              const Component = (await import('@/pages/proTable/treeFilter/index.tsx')).default
              return { Component }
            },
            handle: { title: 'menu:table.treeTable' },
          },

        ],
      },
      // 表单
      {
        path: 'form',
        handle: { title: 'menu:form.title' },
        children: [
          {
            index: true,
            element: <Navigate to="basicForm" replace />,
          },
          {
            path: 'basicForm',
            lazy: async () => {
              const Component = (await import('@/pages/proForm/basicForm/index.tsx')).default
              return { Component }
            },
            handle: {
              title: 'menu:form.basicForm',
            },
          },
          {
            path: 'complexForm',
            lazy: async () => {
              const Component = (await import('@/pages/proForm/complexForm/index.tsx')).default
              return { Component }
            },
            handle: {
              title: 'menu:form.complexForm',
            },
          },
          {
            path: 'dynamicForm',
            lazy: async () => {
              const Component = (await import('@/pages/proForm/dynamicForm/index.tsx')).default
              return { Component }
            },
            handle: {
              title: 'menu:form.dynamicForm',
            },
          },
        ],
      },
      // 图表
      {
        path: 'chart',
        handle: { title: 'menu:chart.title' },
        children: [
          {
            index: true,
            element: <Navigate to="barChart" replace />,
          },
          {
            path: 'barChart',
            lazy: async () => {
              const Component = (await import('@/pages/chart/barChart/index.tsx')).default
              return { Component }
            },
            handle: {
              title: 'menu:chart.barChart',
            },
          },
          {
            path: 'lineChart',
            lazy: async () => {
              const Component = (await import('@/pages/chart/lineChart/index.tsx')).default
              return { Component }
            },
            handle: {
              title: 'menu:chart.lineChart',
            },
          },
          {
            path: 'areaChart',
            lazy: async () => {
              const Component = (await import('@/pages/chart/areaChart/index.tsx')).default
              return { Component }
            },
            handle: {
              title: 'menu:chart.areaChart',
            },
          },
          {
            path: 'pieChart',
            lazy: async () => {
              const Component = (await import('@/pages/chart/pieChart/index.tsx')).default
              return { Component }
            },
            handle: {
              title: 'menu:chart.pieChart',
            },
          },
          {
            path: 'radarChart',
            lazy: async () => {
              const Component = (await import('@/pages/chart/radarChart/index.tsx')).default
              return { Component }
            },
            handle: {
              title: 'menu:chart.radarChart',
            },
          },
          {
            path: 'radialChart',
            lazy: async () => {
              const Component = (await import('@/pages/chart/radialChart/index.tsx')).default
              return { Component }
            },
            handle: {
              title: 'menu:chart.radialChart',
            },
          },
        ],
      },
      // 仪表盘
      {
        path: 'dashboard',
        handle: { title: '仪表盘' },
        children: [
          {
            index: true,
            element: <Navigate to="dataVisualization" replace />,
          },
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
