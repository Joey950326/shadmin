import assert from 'node:assert/strict'
import { QueryClient } from '@tanstack/react-query'
import { createServer as createViteServer } from 'vite'

const vite = await createViteServer({
  configFile: 'vite.config.ts',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

try {
  const { QUERY_KEYS } = await vite.ssrLoadModule('/src/services/api/keys/index.ts')
  const queryClient = new QueryClient()
  let requestCount = 0

  async function fetchNavigation(username, menuIds) {
    return queryClient.fetchQuery({
      queryKey: QUERY_KEYS.MENU.AUTHORIZED_NAVIGATION(username),
      queryFn: async () => {
        requestCount += 1
        return { username, menuIds }
      },
      staleTime: Infinity,
      gcTime: Infinity,
    })
  }

  await fetchNavigation('user', ['menu-home'])
  const adminNavigation = await fetchNavigation('admin', ['menu-home', 'menu-system-menu'])

  assert.equal(adminNavigation.username, 'admin')
  assert.ok(adminNavigation.menuIds.includes('menu-system-menu'))
  assert.equal(requestCount, 2, 'each account should load its own navigation')
  console.log('PASS: account switch loads the matching navigation cache')
}
finally {
  await vite.close()
}
