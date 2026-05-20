import type { Api } from '../types/api'
import request from '../request'
import { AUTH_URLS } from '../urls/auth'

/** 登录api */
export function loginApi(data: Api.Auth.LoginParams, options?: Api.Base.RequestOptions) {
  return request.post<Api.Auth.LoginResponse>(AUTH_URLS.LOGIN, data, options)
}
