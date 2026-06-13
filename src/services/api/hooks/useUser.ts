import type { Api } from '../types/api'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../keys'
import { userAddApi, userAvatarUpload, userDeleteApi, userDownload, userEditApi, userListApi, userStatusChange } from '../modules/user'

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

/** 新增用户 */
export function useAddtUser() {
  return useMutation({
    mutationFn: (params: Api.User.AddParams): Promise<Api.User.AddResponse> => userAddApi(params),
  })
}

/** 上传用户头像 */
export function useAvatarUpload() {
  return useMutation({
    mutationFn: (params: Api.User.AvatarUploadParams): Promise<Api.User.AvatarUploadResponse> => userAvatarUpload(params),
  })
}

/** 修改用户状态 */
export function useStatusChange() {
  return useMutation({
    mutationFn: (params: Api.User.StatusChangeParams): Promise<Api.User.StatusChangeResponse> => userStatusChange(params),
  })
}

/** 通过上传批量添加用户 */
export function useImportUser() {
  return useMutation({
    mutationFn: (params: Api.User.ImportUserParams): Promise<Api.User.ImportResponse> => userAvatarUpload(params),
  })
}

/** 获取用户导入模板 */
export function useUserImportDownload(params: Api.User.DownloadParams) {
  return useQuery<Api.User.ListResponse>({
    queryKey: QUERY_KEYS.USER.DOWNLOAD(params),
    queryFn: (): Promise<Api.User.DownloadResponse> => userDownload(params),
    enabled: false,
    // placeholderData: keepPreviousData,
  })
}
