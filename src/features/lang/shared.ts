import type { TOptions } from 'i18next'
import i18n from './index'

export function t(key: string, options?: TOptions | Record<string, unknown>): string {
  return i18n.t(key, options)
}

// 支持插值 + 默认值
export function translate(key: string, options: TOptions & { defaultValue?: string } = {}): string {
  return i18n.t(key, options)
}

export default t
