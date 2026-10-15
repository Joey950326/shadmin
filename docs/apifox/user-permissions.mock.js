const authorization = String(
  $$.mockRequest.headers.get('x-access-token') || '',
).replace(/^Bearer\s+/i, '')

const permissionCodesByToken = {
  'mock-access-token-2026': ['demo:view', 'demo:edit', 'demo:delete'],
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
