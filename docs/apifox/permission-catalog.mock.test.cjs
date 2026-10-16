const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const openapi = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8'))
const script = fs.readFileSync(path.join(__dirname, 'permission-catalog.mock.js'), 'utf8')
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

function runCatalogMock() {
  let response
  vm.runInNewContext(script, {
    $$: { mockResponse: { setBody: (body) => { response = JSON.parse(JSON.stringify(body)) } } },
  })
  return response
}

test('permission catalog mock returns stable bilingual operation choices', () => {
  const response = runCatalogMock()
  assert.equal(response.code, 200)
  assert.ok(response.data.length > 0)
  for (const item of response.data) {
    assert.deepEqual(Object.keys(item).sort(), ['code', 'description', 'nameEn', 'nameZh'])
    assert.match(item.code, /^[a-z]+:[a-z-]+$/)
    assert.ok(item.nameZh && item.nameEn && item.description)
  }
  assert.ok(response.data.some(item => item.code === 'role:edit'))
  assert.ok(response.data.some(item => item.code === 'demo:view'))
})

test('permission catalog includes every operation permission used by frontend management pages', () => {
  const catalogCodes = new Set(runCatalogMock().data.map(item => item.code))
  assert.deepEqual(
    frontendManagementPermissionCodes.filter(code => !catalogCodes.has(code)),
    [],
  )
})

test('OpenAPI defines the catalog and keeps permission codes independent of menu IDs', () => {
  const operation = openapi.paths['/permission/catalog']?.post
  assert.equal(operation?.operationId, 'getPermissionCatalog')
  assert.deepEqual(operation?.responses?.['200']?.content?.['application/json']?.example?.data, runCatalogMock().data)

  for (const name of ['RoleCreateRequest', 'RoleUpdateRequest']) {
    const schema = openapi.components.schemas[name]
    assert.ok(schema.required.includes('menuIds'))
    assert.ok(schema.required.includes('permissionCodes'))
    assert.equal(schema.properties.permissionCodes.items.type, 'string')
    const example = openapi.paths[name === 'RoleCreateRequest' ? '/role/add' : '/role/edit'].post.requestBody.content['application/json'].example
    assert.ok(example.permissionCodes.length > 0)
    assert.ok(Array.isArray(example.menuIds))
  }
  const detail = openapi.paths['/role/detail'].post.responses['200'].content['application/json'].example.data
  assert.ok(Array.isArray(detail.menuIds))
  assert.ok(Array.isArray(detail.permissionCodes))
  assert.ok(openapi.components.schemas.RoleDetailResponse.properties.data.allOf[1].required.includes('permissionCodes'))
})
