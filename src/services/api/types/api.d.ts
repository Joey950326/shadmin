import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

declare namespace Api {
  namespace Base {

    interface RequestOptions {
      showLoading?: boolean // 是否显示全局加载状态
      cancelDuplicate?: boolean // 是否取消重复请求（默认开启）
      withToken?: boolean // 是否自动注入 Token（默认开启）
      showError?: boolean // 是否显示全局错误提示（默认关闭）
      showSuccess?: boolean // 是否显示全局成功提示（默认关闭）
    }

    interface RequestInternalConfig<D = any> extends InternalAxiosRequestConfig<D>, RequestOptions {}

    interface RequestConfig<D = any> extends AxiosRequestConfig<D>, RequestOptions {}

    interface ResponseData<T = any> {
      code?: number
      msg?: string
      data?: T
    }
  }

  namespace Auth {
    interface LoginParams {
      username: string
      password: string
    }
    interface LoginResponse extends Base.ResponseData<{
      access_token: string
      userInfo?: {
        username: string
        [key: string]: any
      }
    }> {}
  }

  namespace User {
    interface ListParams {
      startTime?: string
      endTime?: string
      page: number
      pageSize: number
      type?: number
    }

    interface DeleteParams {
      id: Array<string>
    }

    interface UserInfo {
      address: string
      avatar: string
      createTime: string
      email: string
      gender: number
      id: string
      idCard: string
      status: number
      user: {
        detail: {
          age: number
        }
      }
      username: string
    }

    interface ListResponse extends Base.ResponseData<{
      pageNum: number
      pageSize: number
      total: number
      list: Array<UserInfo>
    }> {}

    interface DeleteResponse extends Base.ResponseData {}
  }
}

declare module 'axios' {
  export interface AxiosResponse<T = any, D = any> extends ResponseData<T> {}
}
