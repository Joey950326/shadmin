import type { Api } from '../types/api'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../keys'
import { userAvatarUpload, userDeleteApi, userEditApi, userListApi } from '../modules/user'

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

/** 编辑用户 */
export function useEditUser() {
  return useMutation({
    mutationFn: (params: Api.User.EditParams): Promise<Api.User.EditResponse> => userEditApi(params),
  })
}

/** 编辑用户 */
export function useAvatarUpload() {
  return useMutation({
    mutationFn: (params: Api.User.AvatarUploadParams): Promise<Api.User.AvatarUploadResponse> => userAvatarUpload(params),
  })
}
