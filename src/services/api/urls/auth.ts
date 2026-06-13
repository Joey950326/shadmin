const API_BASE_URL = import.meta.env.VITE_BASE_URL || ''

export const AUTH_URLS = {
  LOGIN: `${API_BASE_URL}/geeker/login`, // 登录接口
  LOGOUT: `${API_BASE_URL}/geeker/logout`, // 退出登录接口
}

export const USER_URLS = {
  LIST: `${API_BASE_URL}/geeker/user/list`, // 获取用户列表接口
  DELETE: `${API_BASE_URL}/geeker/user/delete`, // 删除用户
  EDIT: `${API_BASE_URL}/geeker/user/edit`, // 编辑用户
  ADD: `${API_BASE_URL}/geeker/user/add`, // 编辑用户
  AVATAR_UPLOAD: `${API_BASE_URL}/geeker/file/upload/img`, // 上传头像
  IMPORT: `${API_BASE_URL}/geeker/user/import`, // 批量上传用户
  DOWNLOAD: `${API_BASE_URL}/geeker/user/export`, // 下载用户导入模板
  CHANGE: `${API_BASE_URL}/geeker/user/change`, // 修改用户状态
}

export const DEPARTMENT_URLS = {
  LIST: `${API_BASE_URL}/geeker/user/department`, // 获取部门列表接口
}
