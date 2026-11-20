import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import i18next from 'i18next'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const routerDir = path.join(root, 'src/features/router')
const gateFiles = ['AuthGate.tsx', 'NoAuthGate.tsx']

const hanInToastLiteral = /toast\.(?:error|success)\(\s*['"][^'"]*[\u4e00-\u9fff]/

for (const file of gateFiles) {
  const source = fs.readFileSync(path.join(routerDir, file), 'utf8')
  assert.equal(
    hanInToastLiteral.test(source),
    false,
    `${file} must not hardcode Chinese in toast messages (use i18n)`,
  )
  assert.match(
    source,
    /\bt\(/,
    `${file} must call t() for gate toast copy`,
  )
}

const translationKeys = [
  'login.loginRequiredToAccess',
  'login.redirecting',
  'login.alreadyLoggedInNoNeed',
]

const resources = {
  en: {
    auth: JSON.parse(
      fs.readFileSync(path.join(root, 'src/features/lang/locales/en/auth.json'), 'utf8'),
    ),
  },
  zh: {
    auth: JSON.parse(
      fs.readFileSync(path.join(root, 'src/features/lang/locales/zh/auth.json'), 'utf8'),
    ),
  },
}

for (const language of ['en', 'zh']) {
  const instance = i18next.createInstance()
  await instance.init({
    resources,
    lng: language,
    fallbackLng: false,
    ns: ['auth'],
    defaultNS: 'auth',
    initImmediate: false,
  })

  for (const key of translationKeys) {
    assert.ok(instance.exists(key), `${language} auth.json is missing key: ${key}`)
  }
}

const en = i18next.createInstance()
await en.init({
  resources,
  lng: 'en',
  fallbackLng: false,
  ns: ['auth'],
  defaultNS: 'auth',
  initImmediate: false,
})

assert.equal(
  en.t('login.loginRequiredToAccess'),
  'You need to log in to access this page',
  'English login-required toast must match product copy',
)

console.log('PASS: Router gate toasts are i18n-backed')