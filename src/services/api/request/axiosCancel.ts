import type { Api } from '../types/api'

class AxiosCancel {
  /** 请求记录表 */
  private pendingMap = new Map<string, AbortController>()

  /** 获取请求id */
  private generateKey(config: Api.Base.RequestInternalConfig | Api.Base.RequestConfig): string {
    return [
      config.method?.toUpperCase() || 'GET',
      config.url || '',
      JSON.stringify(config.params ?? {}),
      JSON.stringify(config.data ?? {}),
    ].join('&')
  }

  /** 添加请求 */
  addPending(config: Api.Base.RequestInternalConfig): void {
    const key = this.generateKey(config)

    if (config.cancelDuplicate) {
      this.removePending(config) // 如果已经存在相同请求，则取消之前的请求
    }

    const controller = new AbortController()
    this.pendingMap.set(key, controller)
    config.signal = controller.signal // 将 AbortController 的 signal 绑定到请求配置中
  }

  /** 移除请求 */
  removePending(config: Api.Base.RequestConfig): void {
    const key = this.generateKey(config)
    const controller = this.pendingMap.get(key)
    if (controller) {
      controller.abort() // 取消请求
      this.pendingMap.delete(key) // 从记录表中移除
    }
  }

  /** 移除已完成的请求 */
  removeCompleted(config: Api.Base.RequestConfig): void {
    const key = this.generateKey(config)
    this.pendingMap.delete(key)
  }

  /** 取消所有请求 */
  cancelAll(): void {
    this.pendingMap.forEach((controller) => {
      controller.abort()
    })
    this.pendingMap.clear()
  }

  /** 判断错误是否为取消导致 */
  isCancel(error: unknown): boolean {
    if (!error || typeof error !== 'object')
      return false
    const err = error as Record<string, any>
    return err.name === 'AbortError'
      || err.message?.includes('请求被取消')
      || err.code === 'ERR_CANCELED'
  }
}

export const axiosCancel = new AxiosCancel()
export default axiosCancel
