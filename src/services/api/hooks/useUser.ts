import type { Api } from '../types/api'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../keys'
import { userListApi } from '../modules/user'

/** 获取用户列表，用于渲染表格 */
export function useUserList(params: Api.User.ListParams) {
  return useQuery<Api.User.ListResponse>({
    queryKey: QUERY_KEYS.USER.LIST(params),
    queryFn: (): Promise<Api.User.ListResponse> => userListApi(params),
    placeholderData: keepPreviousData,
  })
}
