const API_BASE_URL = import.meta.env.VITE_BASE_URL || ''

export const AUTH_URLS = {
  LOGIN: `${API_BASE_URL}/login`, // 登录接口
  LOGOUT: `${API_BASE_URL}/logout`, // 退出登录接口
}

export const USER_URLS = {
  LIST: `${API_BASE_URL}/user/list`, // 获取用户列表接口
  DELETE: `${API_BASE_URL}/user/delete`, // 删除用户
  EDIT: `${API_BASE_URL}/user/edit`, // 编辑用户
  ADD: `${API_BASE_URL}/user/add`, // 编辑用户
  AVATAR_UPLOAD: `${API_BASE_URL}/file/upload/img`, // 上传头像
  IMPORT: `${API_BASE_URL}/user/import`, // 批量上传用户
  DOWNLOAD: `${API_BASE_URL}/user/export`, // 下载用户导入模板
  CHANGE: `${API_BASE_URL}/user/change`, // 修改用户状态
}

export const DEPARTMENT_URLS = {
  LIST: `${API_BASE_URL}/user/department`, // 获取部门列表接口
}
