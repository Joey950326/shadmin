const API_BASE_URL = import.meta.env.VITE_BASE_URL || ''

export const MENU_URLS = {
  TREE: `${API_BASE_URL}/menu/tree`,
  USER_MENUS: `${API_BASE_URL}/user/menus`,
}
