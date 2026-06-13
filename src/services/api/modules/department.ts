import type { Api } from '../types/api'
import request from '../request'
import { DEPARTMENT_URLS } from '../urls/auth'

/** 获取部门列表API */
export function DepartmentListApi(options?: Api.Base.RequestOptions) {
  return request.get<Api.Department.ListResponse>(DEPARTMENT_URLS.LIST, options)
}
