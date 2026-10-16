const authorization = String(
  $$.mockRequest.headers.get('x-access-token') || '',
).replace(/^Bearer\s+/i, '')

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

const permissionCodesByToken = {
  'mock-access-token-2026': adminPermissionCodes,
  'mock-access-token-user': ['demo:view'],
}
const permissionCodes = permissionCodesByToken[authorization]

if (!permissionCodes) {
  $$.mockResponse.setBody({
    code: 401,
    msg: '未授权',
    data: null,
  })
}
else {
  $$.mockResponse.setBody({
    code: 200,
    msg: '查询成功',
    data: { permissionCodes },
  })
}
