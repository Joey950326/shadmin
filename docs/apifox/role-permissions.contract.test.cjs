const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')
const { pathToFileURL } = require('node:url')

const roleFormMappingUrl = pathToFileURL(path.join(__dirname, '../../src/pages/system/roles/roleFormMapping.mjs'))

test('role detail mapping backfills permission codes and preserves menu authorizations in add/edit payloads', async () => {
  const { mapRoleDetailToForm, mapRoleMutationPayload } = await import(roleFormMappingUrl)
  const form = mapRoleDetailToForm({
    roleName: '管理角色',
    roleCode: 'admin',
    description: '管理权限',
    status: 1,
    menuIds: ['visible-menu', 'hidden-disabled-menu'],
    permissionCodes: ['role:edit', 'role:delete'],
  })

  assert.deepEqual(form.permissionCodes, ['role:edit', 'role:delete'])
  assert.deepEqual(mapRoleDetailToForm({ ...form, permissionCodes: undefined }).permissionCodes, [])

  const payload = mapRoleMutationPayload(form, ['visible-menu'], ['hidden-disabled-menu'])
  assert.deepEqual(payload.permissionCodes, ['role:edit', 'role:delete'])
  assert.deepEqual(payload.menuIds, ['hidden-disabled-menu', 'visible-menu'])
  assert.deepEqual(mapRoleMutationPayload(form, ['visible-menu', 'hidden-disabled-menu'], ['hidden-disabled-menu']).menuIds, [
    'hidden-disabled-menu',
    'visible-menu',
  ])

  const addPayload = mapRoleMutationPayload(form, ['visible-menu'], ['hidden-disabled-menu'])
  const editPayload = { ...mapRoleMutationPayload(form, ['visible-menu'], ['hidden-disabled-menu']), id: 'role-1' }
  assert.deepEqual(addPayload.permissionCodes, ['role:edit', 'role:delete'])
  assert.deepEqual(addPayload.menuIds, ['hidden-disabled-menu', 'visible-menu'])
  assert.deepEqual(editPayload.permissionCodes, addPayload.permissionCodes)
  assert.deepEqual(editPayload.menuIds, addPayload.menuIds)
  assert.equal(editPayload.id, 'role-1')
})
