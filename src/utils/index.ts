import md5 from 'md5'

export function hashPassword(password: string): string {
  return md5(password)
}

export const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t))
