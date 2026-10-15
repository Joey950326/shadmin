const authorization = String(
  $$.mockRequest.headers.get('x-access-token') || '',
).replace(/^Bearer\s+/i, '')

const userMenuIds = [
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

const adminMenuIds = [
  ...userMenuIds,
  'menu-users',
  'menu-system-roles',
  'menu-system-menu',
  'menu-svg-icons',
  'menu-collapse-sub1',
  'menu-collapse-sub2-1',
  'menu-collapse-sub2-2',
  'menu-collapse-sub3',
]

const menuIdsByToken = {
  'mock-access-token-2026': adminMenuIds,
  'mock-access-token-user': userMenuIds,
}
const menuIds = menuIdsByToken[authorization]

if (!menuIds) {
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
    data: { menuIds },
  })
}
