const MockJs = require('mockjs')

const total = 100
const requestedPage = Number($$.mockRequest.getParam('page'))
const requestedPageSize = Number($$.mockRequest.getParam('pageSize'))
const page
  = Number.isFinite(requestedPage) && requestedPage > 0
    ? Math.floor(requestedPage)
    : 1
const pageSize
  = Number.isFinite(requestedPageSize) && requestedPageSize > 0
    ? Math.min(Math.floor(requestedPageSize), total)
    : 10

function pad(value, length) {
  return String(value).padStart(length, '0')
}

function buildUser(index) {
  const number = index + 1
  const id = 1000 + number
  const month = pad((index % 12) + 1, 2)
  const day = pad((index % 28) + 1, 2)

  return {
    id: `user-${id}`,
    username: MockJs.mock('@cname'),
    avatar: `https://example.com/avatar/user-${id}.png`,
    address: MockJs.mock('@county(true)'),
    email: `user${pad(number, 4)}@example.com`,
    gender: (index % 2) + 1,
    phone: `138${pad(number, 8)}`,
    roleId: index % 2 === 0 ? 'role-editor' : 'role-viewer',
    roleName: index % 2 === 0 ? '内容管理员' : '只读用户',
    idCard: `31010119900101${pad(number, 4)}`,
    status: index % 3 === 0 ? 0 : 1,
    createTime: `2026-${month}-${day} 09:30:00`,
    user: {
      detail: {
        age: 20 + (index % 30),
      },
    },
  }
}

const allUsers = Array.from({ length: total }, (_, index) => {
  return buildUser(index)
})

const usernameFilter = String($$.mockRequest.getParam('username') || '').toLowerCase()
const phoneFilter = String($$.mockRequest.getParam('phone') || '')
const genderFilter = $$.mockRequest.getParam('gender')
const statusFilter = $$.mockRequest.getParam('status')
const filteredUsers = allUsers.filter((user) => {
  return (!usernameFilter || user.username.toLowerCase().includes(usernameFilter))
    && (!phoneFilter || user.phone.includes(phoneFilter))
    && (genderFilter === undefined || genderFilter === null || genderFilter === '' || user.gender === Number(genderFilter))
    && (statusFilter === undefined || statusFilter === null || statusFilter === '' || user.status === Number(statusFilter))
})

const filteredTotal = filteredUsers.length
const startIndex = (page - 1) * pageSize
const list = filteredUsers.slice(startIndex, startIndex + pageSize)

$$.mockResponse.setBody({
  code: 200,
  msg: '查询成功',
  data: {
    pageNum: page,
    pageSize,
    total: filteredTotal,
    list,
  },
})
