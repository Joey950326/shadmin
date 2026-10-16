const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const script = fs.readFileSync(path.join(__dirname, 'user-menus.mock.js'), 'utf8')
const menuTree = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8'))
  .paths['/menu/tree']
  .post
  .responses['200']
  .content['application/json']
  .example
  .data

function collectPageIds(nodes) {
  return nodes.flatMap(node => [
    ...(node.type === 'page' ? [node.id] : []),
    ...collectPageIds(node.children ?? []),
  ])
}

// These pre-existing mock pages are not present in the committed baseline tree example.
const legacyMockPageIds = [
  'menu-home',
  'menu-dashboard-data',
  'menu-table-basic',
  'menu-table-complex',
  'menu-table-tree',
  'menu-form-basic',
  'menu-form-complex',
  'menu-form-dynamic',
  'menu-chart-bar',
  'menu-chart-line',
  'menu-chart-area',
  'menu-chart-pie',
  'menu-chart-radar',
  'menu-chart-radial',
]
const documentedPageIds = new Set(collectPageIds(menuTree))
const allowedPageIds = new Set([...documentedPageIds, ...legacyMockPageIds])
const exceptionPageIds = [
  'menu-exception-403',
  'menu-exception-404',
  'menu-exception-500',
]

function runScript(authorization) {
  let responseBody
  const headers = new Map(
    authorization ? [['x-access-token', authorization]] : [],
  )

  vm.runInNewContext(script, {
    $$: {
      mockRequest: {
        headers: {
          get: key => headers.get(key),
        },
      },
      mockResponse: {
        setBody: (body) => {
          responseBody = JSON.parse(JSON.stringify(body))
        },
      },
    },
  })

  return responseBody
}

test('user token returns allowed pages but excludes restricted groups', () => {
  const response = runScript('Bearer mock-access-token-user')

  assert.equal(response.code, 200)
  assert.ok(response.data.menuIds.includes('menu-home'))
  assert.ok(response.data.menuIds.includes('menu-route-tabs'))
  assert.ok(exceptionPageIds.every(id => response.data.menuIds.includes(id)))
  assert.ok(exceptionPageIds.every(id => documentedPageIds.has(id)))
  assert.ok(response.data.menuIds.every(id => allowedPageIds.has(id)))
  assert.ok(!response.data.menuIds.some(id => (
    id.startsWith('menu-system-')
    || id === 'menu-users'
    || id === 'menu-svg-icons'
    || id.startsWith('menu-collapse-')
  )))
})

test('admin token retains the full set of page permissions', () => {
  const response = runScript('Bearer mock-access-token-2026')

  assert.equal(response.code, 200)
  assert.equal(response.data.menuIds.length, 27)
  assert.ok(exceptionPageIds.every(id => response.data.menuIds.includes(id)))
  assert.ok(response.data.menuIds.includes('menu-system-menu'))
  assert.ok(response.data.menuIds.includes('menu-permission-switch'))
  assert.ok(response.data.menuIds.includes('menu-route-tabs'))
})

test('both menu tree examples expose the enabled route tabs page under system features', () => {
  const openapi = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8'))
  for (const endpoint of ['/menu/tree', '/menu/available-tree']) {
    const tree = openapi.paths[endpoint].post.responses['200'].content['application/json'].example.data
    const findNode = (nodes, id) => nodes.find(node => node.id === id)
      ?? nodes.map(node => findNode(node.children ?? [], id)).find(Boolean)
    const page = findNode(tree, 'menu-route-tabs')

    assert.deepEqual(
      { nameZh: page?.nameZh, nameEn: page?.nameEn, parentId: page?.parentId, path: page?.path, sort: page?.sort, status: page?.status, type: page?.type },
      { nameZh: '标签页', nameEn: 'Route Tabs', parentId: 'menu-system-features', path: '/systemFeatures/tabs', sort: 2, status: 1, type: 'page' },
    )
  }
})

test('admin role and current-user menu examples include route tabs authorization', () => {
  const openapi = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8'))
  const menuIds = openapi.paths['/user/menus'].post.responses['200'].content['application/json'].example.data.menuIds
  const adminRoleIds = []
  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit)
    }
    else if (value && typeof value === 'object') {
      if (value.roleCode === 'admin' && Array.isArray(value.menuIds)) {
        adminRoleIds.push(value.menuIds)
      }
      Object.values(value).forEach(visit)
    }
  }
  visit(openapi.paths)

  assert.ok(menuIds.includes('menu-route-tabs'))
  assert.ok(adminRoleIds.length > 0)
  assert.ok(adminRoleIds.every(ids => ids.includes('menu-route-tabs')))
})

test('unknown token is rejected', () => {
  const response = runScript('Bearer unknown')

  assert.equal(response.code, 401)
})
