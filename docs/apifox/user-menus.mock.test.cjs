const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const script = fs.readFileSync(path.join(__dirname, 'user-menus.mock.js'), 'utf8')
const menuTree = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8'))
  .paths['/menu/tree'].post.responses['200'].content['application/json'].example.data

function collectPageIds(nodes) {
  return nodes.flatMap(node => [
    ...(node.type === 'page' ? [node.id] : []),
    ...collectPageIds(node.children ?? []),
  ])
}

const knownPageIds = new Set(collectPageIds(menuTree))

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
        setBody: body => {
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
  assert.ok(response.data.menuIds.every(id => knownPageIds.has(id)))
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
  assert.equal(response.data.menuIds.length, 22)
  assert.ok(response.data.menuIds.includes('menu-system-menu'))
})

test('unknown token is rejected', () => {
  const response = runScript('Bearer unknown')

  assert.equal(response.code, 401)
})
