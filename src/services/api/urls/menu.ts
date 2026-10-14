const API_BASE_URL = import.meta.env.VITE_BASE_URL || ''

export const MENU_URLS = {
  TREE: `${API_BASE_URL}/menu/tree`,
  ADD: `${API_BASE_URL}/menu/add`,
  EDIT: `${API_BASE_URL}/menu/edit`,
  USER_MENUS: `${API_BASE_URL}/user/menus`,
}
