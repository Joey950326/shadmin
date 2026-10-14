const API_BASE_URL = import.meta.env.VITE_BASE_URL || ''

export const ROLE_URLS = {
  LIST: `${API_BASE_URL}/role/list`,
  OPTIONS: `${API_BASE_URL}/role/options`,
  DETAIL: `${API_BASE_URL}/role/detail`,
  ADD: `${API_BASE_URL}/role/add`,
  EDIT: `${API_BASE_URL}/role/edit`,
  DELETE: `${API_BASE_URL}/role/delete`,
  CHANGE: `${API_BASE_URL}/role/change`,
}
