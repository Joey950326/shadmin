import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import i18next from 'i18next'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rolePage = fs.readFileSync(
  path.join(root, 'src/pages/system/roles/index.tsx'),
  'utf8',
)
const i18nConfig = fs.readFileSync(
  path.join(root, 'src/features/lang/index.ts'),
  'utf8',
)
const defaultNamespace = i18nConfig.match(/defaultNS:\s*'([^']+)'/)?.[1]
if (!defaultNamespace) {
  throw new Error('Could not find the configured i18next default namespace.')
}
const keys = [
  ...new Set(
    [...rolePage.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)].map(match => match[1]),
  ),
]
const resources = Object.fromEntries(
  ['en', 'zh'].map(language => [
    language,
    {
      common: JSON.parse(
        fs.readFileSync(
          path.join(root, `src/features/lang/locales/${language}/common.json`),
          'utf8',
        ),
      ),
    },
  ]),
)
const expectedLabels = {
  en: { status: 'Status', enabled: 'Enabled', view: 'View' },
  zh: { status: '状态', enabled: '启用', view: '查看' },
}
const unresolved = []

for (const language of ['en', 'zh']) {
  const instance = i18next.createInstance()
  await instance.init({
    resources,
    lng: language,
    fallbackLng: false,
    ns: [defaultNamespace],
    defaultNS: defaultNamespace,
    initImmediate: false,
  })

  for (const key of keys) {
    if (!instance.exists(key)) {
      unresolved.push(`${language}: ${key}`)
    }
  }

  for (const [key, expected] of Object.entries(expectedLabels[language])) {
    const actual = instance.t(key)
    if (actual !== expected) {
      unresolved.push(`${language}: ${key} expected ${expected}, got ${actual}`)
    }
  }
}

if (unresolved.length) {
  throw new Error(`Unresolved role translations:\n${unresolved.join('\n')}`)
}

console.log(`Resolved ${keys.length} role translation keys in English and Chinese.`)
