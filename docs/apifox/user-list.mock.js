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
const startIndex = (page - 1) * pageSize
const list = allUsers.slice(startIndex, startIndex + pageSize)

$$.mockResponse.setBody({
  code: 200,
  msg: '查询成功',
  data: {
    pageNum: page,
    pageSize,
    total,
    list,
  },
})
