import md5 from 'md5'

export function hashPassword(password: string): string {
  return md5(password)
}

export const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t))

export const getDateNow = () => new Date()

/** 格式化文件大小 */
export function transformFileSize(size: number) {
  if (size === 0)
    return size
  let calcSize = size
  let idx = 0
  const suffix = ['B', 'KB', 'MB', 'GB']
  while (calcSize > 1024) {
    if (idx > 2)
      break
    idx += 1
    calcSize /= 1024
  }
  return `${Math.round(calcSize)} ${suffix[idx]}`
}

// 获取当前时间，返回格式为'YYYYMMDDHHmmSS'
export function getDateNowText(): string {
  const d = getDateNow()
  const Y = String(d.getFullYear())
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${Y}${M}${D}${hh}${mm}${ss}`
}
