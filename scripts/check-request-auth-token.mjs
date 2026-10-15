import assert from 'node:assert/strict'
import http from 'node:http'
import path from 'node:path'
import { createServer as createViteServer } from 'vite'

const testToken = 'mock-token-for-request-test'
globalThis.localStorage = { getItem: () => null }
let receivedAuthorization

const apiServer = http.createServer((request, response) => {
  receivedAuthorization = request.headers['x-access-token']
  response.writeHead(200, { 'content-type': 'application/json' })
  response.end(JSON.stringify({ code: 200, msg: 'ok', data: {} }))
})

const vite = await createViteServer({
  configFile: 'vite.config.ts',
  resolve: {
    alias: [{ find: '@/store', replacement: path.resolve('scripts/request-auth-test-store.mjs') }],
  },
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

try {
  await new Promise(resolve => apiServer.listen(0, '127.0.0.1', resolve))
  const { default: request } = await vite.ssrLoadModule('/src/services/api/request/index.ts')
  request.instance.defaults.baseURL = `http://127.0.0.1:${apiServer.address().port}`

  await request.post('/auth-probe', {}, { cancelDuplicate: false })

  assert.equal(
    receivedAuthorization,
    `Bearer ${testToken}`,
    'API request should use the token from Redux user state',
  )
  console.log('PASS: Axios request includes the Redux token')
}
finally {
  await vite.close()
  await new Promise((resolve, reject) => {
    apiServer.close((error) => {
      if (error)
        reject(error)
      else resolve()
    })
  })
}
