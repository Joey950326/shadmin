const API_BASE_URL = import.meta.env.VITE_BASE_URL || ''

export const ROLE_URLS = {
  LIST: `${API_BASE_URL}/role/list`,
  OPTIONS: `${API_BASE_URL}/role/options`,
  DETAIL: `${API_BASE_URL}/role/detail`,
  DELETE: `${API_BASE_URL}/role/delete`,
}
