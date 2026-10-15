import assert from 'node:assert/strict'
import { createServer as createViteServer } from 'vite'

const vite = await createViteServer({
  configFile: 'vite.config.ts',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

try {
  const { hasPermission } = await vite.ssrLoadModule('/src/components/canPermission.ts')
  const grantedPermissions = ['user:read', 'user:update']

  assert.equal(hasPermission(grantedPermissions, 'user:read'), true, 'single permissions match')
  assert.equal(hasPermission(grantedPermissions, ['user:read', 'user:update']), true, 'all is the default')
  assert.equal(hasPermission(grantedPermissions, ['user:read', 'user:delete']), false, 'all requires every code')
  assert.equal(hasPermission(grantedPermissions, ['user:read', 'user:delete'], 'any'), true, 'any requires one code')
  assert.equal(hasPermission(grantedPermissions, ['user:delete', 'user:create'], 'any'), false, 'any fails without a match')
  assert.equal(hasPermission(grantedPermissions, 'user:*'), false, 'wildcards are literal codes')
  assert.equal(hasPermission(grantedPermissions, 'user'), false, 'prefixes are not accepted')
  assert.equal(hasPermission(undefined, 'user:read'), false, 'missing data fails closed')
  assert.equal(hasPermission(grantedPermissions, []), false, 'empty requirements fail closed')

  console.log('PASS: Can permission matching supports single, all, any, and exact matches')
}
finally {
  await vite.close()
}
