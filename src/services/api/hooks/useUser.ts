import type { Api } from '../types/api'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../keys'
import { userDeleteApi, userListApi } from '../modules/user'

/** 获取用户列表，用于渲染表格 */
export function useUserList(params: Api.User.ListParams) {
  return useQuery<Api.User.ListResponse>({
    queryKey: QUERY_KEYS.USER.LIST(params),
    queryFn: (): Promise<Api.User.ListResponse> => userListApi(params),
    placeholderData: keepPreviousData,
  })
}

/** 删除用户 */
export function useDeleteUser() {
  return useMutation({
    mutationFn: (params: Api.User.DeleteParams): Promise<Api.User.DeleteResponse> => userDeleteApi(params),
  })
}
