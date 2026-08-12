// lib/get-css-var.ts
/**
 * 解析 CSS 变量的实际计算值
 * 支持传入 '--color-primary' 或 'var(--color-primary)'
 * @param variable CSS 变量名
 * @param fallback 解析失败时的兜底颜色
 */
export function getCssVar(
  variable: string,
  fallback = 'rgba(0, 0, 0, 0.15)',
): string {
  if (typeof window === 'undefined')
    return fallback

  // 统一去掉 var() 包裹
  const pureVar = variable.replace(/^var\(/, '').replace(/\)$/, '').trim()

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(pureVar)
    .trim()

  return value || fallback
}
