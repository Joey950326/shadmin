const permissions = [
  { code: 'demo:view', nameZh: '查看演示内容', nameEn: 'View demo content', description: '查看权限演示页面内容' },
  { code: 'demo:edit', nameZh: '编辑演示内容', nameEn: 'Edit demo content', description: '查看权限演示页面的编辑操作' },
  { code: 'demo:delete', nameZh: '删除演示内容', nameEn: 'Delete demo content', description: '查看权限演示页面的删除操作' },
  { code: 'user:create', nameZh: '新增用户', nameEn: 'Create user', description: '创建用户账号' },
  { code: 'user:edit', nameZh: '编辑用户', nameEn: 'Edit user', description: '修改用户信息' },
  { code: 'user:delete', nameZh: '删除用户', nameEn: 'Delete user', description: '删除用户账号' },
  { code: 'user:change-status', nameZh: '修改用户状态', nameEn: 'Change user status', description: '启用或停用用户账号' },
  { code: 'role:create', nameZh: '新增角色', nameEn: 'Create role', description: '创建角色' },
  { code: 'role:edit', nameZh: '编辑角色', nameEn: 'Edit role', description: '修改角色信息及授权' },
  { code: 'role:delete', nameZh: '删除角色', nameEn: 'Delete role', description: '删除角色' },
  { code: 'role:change-status', nameZh: '修改角色状态', nameEn: 'Change role status', description: '启用或停用角色' },
  { code: 'menu:create', nameZh: '新增菜单', nameEn: 'Create menu', description: '创建菜单或页面' },
  { code: 'menu:edit', nameZh: '编辑菜单', nameEn: 'Edit menu', description: '修改菜单或页面' },
  { code: 'menu:delete', nameZh: '删除菜单', nameEn: 'Delete menu', description: '删除菜单或页面' },
  { code: 'menu:change-status', nameZh: '修改菜单状态', nameEn: 'Change menu status', description: '启用或停用菜单' },
]

$$.mockResponse.setBody({
  code: 200,
  msg: '查询成功',
  data: permissions,
})
