import type { Api } from '../types/api'
import request from '../request'
import { ROLE_URLS } from '../urls/role'

export function permissionCatalogApi(options?: Api.Base.RequestOptions) {
  return request.post<Api.Permission.CatalogResponse>(
    ROLE_URLS.PERMISSION_CATALOG,
    {},
    options,
  )
}

export function roleListApi(
  data: Api.Role.ListParams,
  options?: Api.Base.RequestOptions,
) {
  return request.post<Api.Role.ListResponse>(ROLE_URLS.LIST, data, options)
}

export function roleOptionsApi(options?: Api.Base.RequestOptions) {
  return request.post<Api.Role.OptionsResponse>(ROLE_URLS.OPTIONS, {}, options)
}

export function roleDetailApi(
  data: Api.Role.DetailParams,
  options?: Api.Base.RequestOptions,
) {
  return request.post<Api.Role.DetailResponse>(ROLE_URLS.DETAIL, data, options)
}

export function roleAddApi(
  data: Api.Role.AddParams,
  options?: Api.Base.RequestOptions,
) {
  return request.post<Api.Role.MutationResponse>(ROLE_URLS.ADD, data, options)
}

export function roleEditApi(
  data: Api.Role.EditParams,
  options?: Api.Base.RequestOptions,
) {
  return request.post<Api.Role.MutationResponse>(ROLE_URLS.EDIT, data, options)
}

export function roleDeleteApi(
  data: Api.Role.DeleteParams,
  options?: Api.Base.RequestOptions,
) {
  return request.post<Api.Role.DeleteResponse>(ROLE_URLS.DELETE, data, options)
}

export function roleStatusChangeApi(
  data: Api.Role.StatusChangeParams,
  options?: Api.Base.RequestOptions,
) {
  return request.post<Api.Role.MutationResponse>(ROLE_URLS.CHANGE, data, options)
}
