import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import type { Api } from '../types/api'
import axios from 'axios'
import httpConfig from '../config'
import axiosCancel from './axiosCancel'

/** 1. 创建 axios 实例 */

const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: httpConfig.REQUEST_TIMEOUT,
  withCredentials: httpConfig.WITH_CREDENTIALS,
  headers: { 'Content-Type': 'application/json' },
}

class Request {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  private handleUnauthorized(config: Api.Base.RequestConfig): void {
    if (config.showError) {
      /** 显示错误提示 */
      console.error('登录状态已过期，请重新登录')
    }
    localStorage.clear()
    window.location.href = '/auth/login'
  }

  private handleDisconnected(): void {
    console.error('网络连接异常，请检查您的网络')
    window.location.href = '/500'
  }

  private setupInterceptors(): void {
    /** 请求拦截器 */
    this.instance.interceptors.request.use((config: Api.Base.RequestInternalConfig) => {
      // 可以在这里添加全局的请求头、token 等
      const mergedConfig = {
        showLoading: false,
        cancelDuplicate: true,
        withToken: true,
        showError: false,
        showSuccess: false,
        ...config,
      }
      /** 注册请求，并判断是否需要取消 */
      if (mergedConfig.cancelDuplicate) {
        axiosCancel.addPending(config)
      }

      /** 是否展示全局loading */
      if (mergedConfig.showLoading) {
        /** */
      }

      // 自动注入 Token
      if (mergedConfig.withToken) {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers = config.headers || {}
          config.headers.set('x-access-token', `Bearer ${token}`)
        }
      }

      return config
    }, (error: AxiosError) => {
      return Promise.reject(error)
    })

    /** 响应拦截器 */
    this.instance.interceptors.response.use((response: AxiosResponse) => {
      // 可以在这里处理全局的响应数据、错误等
      const config = response.config as Api.Base.RequestConfig
      axiosCancel.removeCompleted(config) // 响应回来后移除请求记录

      if (response.data?.code === httpConfig.CODE.UNAUTHORIZED) {
        /** 显示成功提示 */
        this.handleUnauthorized(config)
        return Promise.reject(response.data)
      }

      if (response.data?.code !== httpConfig.CODE.SUCCESS) {
        // 这里可以根据后端的成功响应格式，统一处理成功提示
        if (config.showError) {
          /** 显示错误提示 */
          console.error(response.data?.msg)
        }
        return Promise.reject(response.data)
      }

      if (config.showSuccess) {
        // 这里可以根据后端的成功响应格式，统一处理成功提示
      }
      return response.data
    }, (error: AxiosError) => {
      const config = error.config as Api.Base.RequestConfig
      if (config) {
        axiosCancel.removePending(config) // 响应回来后移除请求记录
      }
      if (config.showError) {
        // 这里可以根据后端的错误格式，统一处理错误提示
      }

      // 判断是否是主动取消的请求（不弹错误提示）
      if (axiosCancel.isCancel(error)) {
        return Promise.reject(error)
      }

      // Token 过期处理
      if (error.response?.status === httpConfig.STATUS.UNAUTHORIZED) {
        this.handleUnauthorized(config)
      }

      // 处理断网
      if (window.navigator.onLine === false) {
        this.handleDisconnected()
      }

      return Promise.reject(error)
    })
  }

  /** 公共请求方法 */

  public request<T = unknown, D = unknown>(config: Api.Base.RequestConfig<D>): Promise<T> {
    return this.instance.request(config)
  }

  public get<T = unknown, D = unknown>(url: string, params?: D, config?: Omit<Api.Base.RequestConfig<D>, 'method' | 'url' | 'params'>): Promise<T> {
    return this.request({ ...config, method: 'GET', url, params })
  }

  public post<T = unknown, D = unknown>(url: string, data?: D, config?: Omit<Api.Base.RequestConfig<D>, 'method' | 'url' | 'data'>): Promise<T> {
    return this.request({ ...config, method: 'POST', url, data })
  }

  public delete<T = unknown, D = unknown>(url: string, params?: D, config?: Omit<Api.Base.RequestConfig<D>, 'method' | 'url' | 'params'>): Promise<T> {
    return this.request({ ...config, method: 'DELETE', url, params })
  }

  public put<T = unknown, D = unknown>(url: string, data?: D, config?: Omit<Api.Base.RequestConfig<D>, 'method' | 'url' | 'data'>): Promise<T> {
    return this.request({ ...config, method: 'PUT', url, data })
  }

  public cancelAllPending(): void {
    axiosCancel.cancelAll()
  }
}

export const request = new Request()
export default request
