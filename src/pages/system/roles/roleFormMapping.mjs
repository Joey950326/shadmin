export function mapRoleDetailToForm(detail) {
  return {
    roleName: detail.roleName,
    roleCode: detail.roleCode,
    description: detail.description ?? '',
    status: detail.status,
    permissionCodes: detail.permissionCodes ?? [],
  }
}

export function mapRoleMutationPayload(form, selectedMenuIds, retainedHiddenMenuIds) {
  return {
    ...form,
    roleName: form.roleName.trim(),
    roleCode: form.roleCode.trim(),
    description: form.description?.trim() || undefined,
    menuIds: [...new Set([...retainedHiddenMenuIds, ...selectedMenuIds])],
    permissionCodes: form.permissionCodes,
  }
}
