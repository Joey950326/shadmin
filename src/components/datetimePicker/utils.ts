import { format, isDate, isValid, parse } from 'date-fns'

export function getTimeFromDate(date: Date, formatString: string = 'HH:mm:SS') {
// 校验输入是否为有效 Date
  if (!(date instanceof Date)) {
    console.warn('[formatTime] 传入的参数不是有效的 Date 对象')
    throw new Error('Invalid Date')
  }

  return format(date, formatString)
}

export function getDateFromDate(date: Date, formatString: string = 'yyyy-MM-dd') {
  if (!(date instanceof Date)) {
    console.warn('[formatTime] 传入的参数不是有效的 Date 对象')
    throw new Error('Invalid Date')
  }
  return format(date, formatString)
}

export function getDateFromString(str: string, formatStr: string = 'yyyy-MM-dd HH:mm:SS') {
  if (!str)
    return null

  try {
    const parsed = parse(str, formatStr, new Date())

    if (isValid(parsed)) {
      return parsed
    }

    return null
  }
  catch (error) {
    console.warn('[parseDate] 解析失败:', error)
    return null
  }
}

export function getDateFromTimestamp(st: number | Date) {
  if (isDate(st))
    return st
  const date = new Date(st)
  if (isValid(date))
    return date
  console.warn('传入的时间戳不合法')
  return new Date()
}
