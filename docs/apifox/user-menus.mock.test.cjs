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
  assert.equal(response.data.menuIds.length, 25)
  assert.ok(exceptionPageIds.every(id => response.data.menuIds.includes(id)))
  assert.ok(response.data.menuIds.includes('menu-system-menu'))
})

test('unknown token is rejected', () => {
  const response = runScript('Bearer unknown')

  assert.equal(response.code, 401)
})
