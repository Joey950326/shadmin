const username = String($$.mockRequest.getParam('username') || '')
const password = String($$.mockRequest.getParam('password') || '')
const initialPasswordMd5 = 'e10adc3949ba59abbe56e057f20f883e'

const accounts = {
  admin: {
    accessToken: 'mock-access-token-2026',
    role: 'administrator',
  },
  user: {
    accessToken: 'mock-access-token-user',
    role: 'user',
  },
}

const account = Object.prototype.hasOwnProperty.call(accounts, username)
  ? accounts[username]
  : null
if (!account || password !== initialPasswordMd5) {
  $$.mockResponse.setBody({
    code: 401,
    msg: '用户名或密码错误',
    data: null,
  })
}
else {
  $$.mockResponse.setBody({
    code: 200,
    msg: '登录成功',
    data: {
      access_token: account.accessToken,
      userInfo: {
        username,
        role: account.role,
      },
    },
  })
}
