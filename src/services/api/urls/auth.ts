const API_BASE_URL = import.meta.env.VITE_BASE_URL || ''

export const AUTH_URLS = {
  LOGIN: `${API_BASE_URL}/geeker/login`, // 登录接口
  LOGOUT: `${API_BASE_URL}/geeker/logout`, // 退出登录接口
}
