import type { Api } from '../types/api'
import request from '../request'
import { MENU_URLS } from '../urls/menu'

export function getMenuTreeApi() {
  return request.post<Api.Menu.TreeResponse>(MENU_URLS.TREE)
}

export function getUserMenusApi() {
  return request.post<Api.Menu.UserMenusResponse>(MENU_URLS.USER_MENUS)
}
