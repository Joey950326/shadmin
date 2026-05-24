/** 静态路由 */
import NoAuthGate from '@/features/router/NoAuthGate'
import Exception403 from '@/pages/403/index.tsx'

const staticRoutes = [
  {
    path: '/403',
    Component: Exception403,
    handle: {
      title: '403页面',
    },
  },
  {
    path: '/404',
    lazy: async () => {
      const Component = (await import('@/pages/404/index.tsx')).default
      return { Component }
    },
    handle: {
      title: '404页面',
    },
  },
  {
    path: '/500',
    lazy: async () => {
      const Component = (await import('@/pages/500/index.tsx')).default
      return { Component }
    },
    handle: {
      title: '500页面',
    },
  },
  {
    path: 'auth',
    lazy: async () => {
      const Mod = (await import('@/pages/login/layout.tsx')).default
      return { Component: () => <NoAuthGate><Mod /></NoAuthGate> }
    },
    handle: {
      title: '登录',
    },
    children: [
      {
        index: true,
        path: 'login',
        lazy: async () => {
          const Component = (await import('@/pages/login/index.tsx')).default
          return { Component }
        },
        handle: {
          title: '登录页面',
        },
      },
      {
        path: 'code-login',
        lazy: async () => {
          const Component = (await import('@/pages/login/CodeLogin.tsx')).default
          return { Component }
        },
        handle: {
          title: '验证码登录',
        },
      },
      {
        path: 'register',
        lazy: async () => {
          const Component = (await import('@/pages/login/Register.tsx')).default
          return { Component }
        },
        handle: {
          title: '注册页面',
        },
      },
    ],
  },
]

export default staticRoutes
