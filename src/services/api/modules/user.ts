import type { Api } from '../types/api'
import request from '../request'
import { USER_URLS } from '../urls/auth'

/** 获取用户列表api */
export function userListApi(data: Api.User.ListParams, options?: Api.Base.RequestOptions) {
  return request.post<Api.User.ListResponse>(USER_URLS.LIST, data, options)
}
