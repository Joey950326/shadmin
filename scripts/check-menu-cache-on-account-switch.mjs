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

  async function fetchAccountData(username, menuIds, permissionCodes) {
    const [navigation, permissions] = await Promise.all([
      queryClient.fetchQuery({
        queryKey: QUERY_KEYS.MENU.AUTHORIZED_NAVIGATION(username),
        queryFn: async () => {
          requestCount += 1
          return { username, menuIds }
        },
        staleTime: Infinity,
        gcTime: Infinity,
      }),
      queryClient.fetchQuery({
        queryKey: QUERY_KEYS.PERMISSION.CURRENT_USER(username),
        queryFn: async () => {
          requestCount += 1
          return permissionCodes
        },
        staleTime: Infinity,
        gcTime: Infinity,
      }),
    ])
    return { navigation, permissions }
  }

  await fetchAccountData('user', ['menu-home'], ['demo:view'])
  const adminData = await fetchAccountData('admin', ['menu-home', 'menu-system-menu'], ['demo:view', 'demo:edit', 'demo:delete'])
  const returnedUserData = await fetchAccountData('user', ['menu-home'], ['demo:view'])

  assert.equal(adminData.navigation.username, 'admin')
  assert.ok(adminData.navigation.menuIds.includes('menu-system-menu'))
  assert.deepEqual(adminData.permissions, ['demo:view', 'demo:edit', 'demo:delete'])
  assert.deepEqual(returnedUserData.permissions, ['demo:view'])
  assert.deepEqual(returnedUserData.navigation.menuIds, ['menu-home'])
  assert.equal(requestCount, 4, 'navigation and permissions should each be isolated per account')
  console.log('PASS: navigation and permission caches stay isolated across both account-switch directions')
}
finally {
  await vite.close()
}
