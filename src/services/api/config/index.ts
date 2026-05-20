import { AxiosError } from 'axios'

/** 请求配置 */
const HttpConfig = {
  REQUEST_TIMEOUT: 10 * 1000,
  WITH_CREDENTIALS: true,
  TYPE: 'success',

  STATUS: {
    SUCCESS: 200,
    ERROR: 500,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
  },
  CODE: {
    SUCCESS: 200,
    UNAUTHORIZED: 401,
  },

}

const REQUEST_TRY_COUNT = 1

function shouldRetry(error: unknown, failureCount: number) {
  if (failureCount >= REQUEST_TRY_COUNT) {
    return false
  }
  if (error instanceof AxiosError) {
    const status = error.response?.status
    // 只在网络错误或服务器错误时重试
    if (status === undefined || (status >= 500 && status < 600)) {
      return true
    }
  }

  // 超时错误或网络错误也应该重试
  if (error instanceof Error) {
    if (error.message.includes('Network Error') || error.message.includes('timeout')) {
      return true
    }
  }

  return false
}

export const DEFAULT_QUERY_CONFIG = {
  gcTime: 10 * 60 * 1000, // 默认缓存时间10分钟
  networkMode: 'online' as const, // 默认网络模式为在线
  refetchOnMount: true, // 组件挂载时自动重新获取数据
  refetchOnReconnect: true, // 重新连接网络时自动重新获取数据
  refetchOnWindowFocus: false, // 窗口重新获得焦点时不自动重新获取数据
  retry: shouldRetry || REQUEST_TRY_COUNT, // 请求失败时重试次数
  retryDelay: 2000, // 请求失败时重试的延迟时间
  retryOnMount: true, // 组件挂载时不自动重试请求
  staleTime: 30 * 1000, // 数据过期时间30秒
}

export const DEFAULT_MUTATION_CONFIG = {
  networkMode: 'online' as const, // 默认网络模式为在线
  retry: shouldRetry || REQUEST_TRY_COUNT, // 请求失败时重试次数
  retryDelay: 2000, // 请求失败时重试的延迟时间
}

export default HttpConfig
