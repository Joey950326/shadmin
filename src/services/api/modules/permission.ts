import type { Api } from '../types/api'
import request from '../request'
import { PERMISSION_URLS } from '../urls/permission'

export function getCurrentUserPermissionsApi() {
  return request.post<Api.Permission.CurrentUserResponse>(PERMISSION_URLS.CURRENT_USER)
}
