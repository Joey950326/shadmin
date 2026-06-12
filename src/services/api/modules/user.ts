import type { Api } from '../types/api'
import request from '../request'
import { USER_URLS } from '../urls/auth'

/** 获取用户列表api */
export function userListApi(data: Api.User.ListParams, options?: Api.Base.RequestOptions) {
  return request.post<Api.User.ListResponse>(USER_URLS.LIST, data, options)
}

/** 删除用户 */
export function userDeleteApi(params: Api.User.DeleteParams, options?: Api.Base.RequestOptions) {
  return request.post<Api.User.DeleteResponse>(USER_URLS.DELETE, params, options)
}

/** 编辑用户 */
export function userEditApi(params: Api.User.EditParams, options?: Api.Base.RequestOptions) {
  return request.post<Api.User.EditResponse>(USER_URLS.EDIT, params, options)
}

/** 新增用户 */
export function userAddApi(params: Api.User.AddParams, options?: Api.Base.RequestOptions) {
  return request.post<Api.User.AddResponse>(USER_URLS.ADD, params, options)
}

/** 上传用户头像 */
export function userAvatarUpload(params: Api.User.AvatarUploadParams, options?: Api.Base.RequestOptions) {
  const formData = new FormData()
  formData.append('file', params.file)
  return request.post<Api.User.AvatarUploadResponse>(USER_URLS.AVATAR_UPLOAD, formData, options)
}

/** 通过导入，批量添加用户 */
export function userImportApi(params: Api.User.ImportUserParams, options?: Api.Base.RequestOptions) {
  const formData = new FormData()
  formData.append('file', params.file)
  return request.post<Api.User.ImportResponse>(USER_URLS.IMPORT, formData, options)
}

/** 下载用户导入模板 */
export function userDownload(data: Api.User.DownloadParams, options?: Api.Base.RequestOptions) {
  return request.post<Api.User.DownloadResponse>(USER_URLS.DOWNLOAD, data, options)
}
