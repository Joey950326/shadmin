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
