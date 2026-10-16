const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const script = fs.readFileSync(path.join(__dirname, 'user-permissions.mock.js'), 'utf8')
const openapi = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8'))
const adminPermissionCodes = [
  'demo:view',
  'demo:edit',
  'demo:delete',
  'user:create',
  'user:edit',
  'user:delete',
  'user:change-status',
  'role:create',
  'role:edit',
  'role:delete',
  'role:change-status',
  'menu:create',
  'menu:edit',
  'menu:delete',
  'menu:change-status',
]
const frontendPermissionFiles = [
  '../../src/pages/systemManagement/users/UserFormDialog.tsx',
  '../../src/pages/systemManagement/users/index.tsx',
  '../../src/pages/system/roles/index.tsx',
  '../../src/pages/systemManagement/menu/index.tsx',
]
const frontendManagementPermissionCodes = [...new Set(
  frontendPermissionFiles.flatMap((file) => {
    const source = fs.readFileSync(path.join(__dirname, file), 'utf8')
    return [...source.matchAll(/[\'\"]((?:user|role|menu):[a-z-]+)[\'\"]/g)].map(match => match[1])
  }),
)].sort()

function runScript(authorization) {
  let responseBody
  const headers = new Map(authorization ? [['x-access-token', authorization]] : [])

  vm.runInNewContext(script, {
    $$: {
      mockRequest: { headers: { get: key => headers.get(key) } },
      mockResponse: { setBody: (body) => { responseBody = JSON.parse(JSON.stringify(body)) } },
    },
  })

  return responseBody
}

function collectPageIds(nodes) {
  return nodes.flatMap(node => [
    ...(node.type === 'page' ? [node.id] : []),
    ...collectPageIds(node.children ?? []),
  ])
}

test('admin token returns every operation permission required by the frontend', () => {
  const response = runScript('Bearer mock-access-token-2026')

  assert.equal(response.code, 200)
  assert.deepEqual(response.data.permissionCodes, adminPermissionCodes)
  assert.deepEqual(
    frontendManagementPermissionCodes,
    adminPermissionCodes.filter(code => /^(user|role|menu):/.test(code)).sort(),
  )
})

test('user token only returns the demo view permission', () => {
  const response = runScript('Bearer mock-access-token-user')

  assert.equal(response.code, 200)
  assert.deepEqual(response.data.permissionCodes, ['demo:view'])
})

test('missing and unknown tokens are unauthorized', () => {
  assert.equal(runScript(undefined).code, 401)
  assert.equal(runScript('Bearer unknown').code, 401)
})

test('both demo accounts have the permission switch page and OpenAPI describes the endpoint', () => {
  const userMenusScript = fs.readFileSync(path.join(__dirname, 'user-menus.mock.js'), 'utf8')
  const tree = openapi.paths['/menu/tree'].post.responses['200'].content['application/json'].example.data
  const findNode = (nodes, id) => nodes.find(node => node.id === id)
    ?? nodes.map(node => findNode(node.children ?? [], id)).find(Boolean)
  const page = findNode(tree, 'menu-permission-switch')
  const tabsPage = findNode(tree, 'menu-route-tabs')

  assert.equal(page?.path, '/systemFeatures/permissionSwitch')
  assert.equal(tabsPage?.path, '/systemFeatures/tabs')
  assert.ok(page)
  assert.ok(tabsPage)
  for (const token of ['Bearer mock-access-token-user', 'Bearer mock-access-token-2026']) {
    let response
    vm.runInNewContext(userMenusScript, {
      $$: {
        mockRequest: { headers: { get: key => key === 'x-access-token' ? token : undefined } },
        mockResponse: { setBody: (body) => { response = JSON.parse(JSON.stringify(body)) } },
      },
    })
    assert.ok(collectPageIds([page, tabsPage]).every(id => response.data.menuIds.includes(id)))
  }

  const operation = openapi.paths['/user/permissions']?.post
  assert.equal(operation?.operationId, 'getCurrentUserPermissions')
  assert.deepEqual(operation?.responses?.['200']?.content?.['application/json']?.examples?.user?.value?.data?.permissionCodes, ['demo:view'])
  assert.deepEqual(operation?.responses?.['200']?.content?.['application/json']?.examples?.admin?.value?.data?.permissionCodes, adminPermissionCodes)
})

test('admin role OpenAPI examples grant all frontend management permissions', () => {
  const roleDetailPermissions = openapi.paths['/role/detail'].post.responses['200'].content['application/json'].example.data.permissionCodes
  const roleEditPermissions = openapi.paths['/role/edit'].post.requestBody.content['application/json'].example.permissionCodes
  const regularRolePermissions = openapi.paths['/role/add'].post.requestBody.content['application/json'].example.permissionCodes

  assert.deepEqual(roleDetailPermissions, adminPermissionCodes)
  assert.deepEqual(roleEditPermissions, adminPermissionCodes)
  assert.deepEqual(regularRolePermissions, ['demo:view'])
})
