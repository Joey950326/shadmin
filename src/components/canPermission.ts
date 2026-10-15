export type CanMode = 'all' | 'any'

export function hasPermission(
  permissionCodes: string[] | undefined,
  permissions: string | string[],
  mode: CanMode = 'all',
): boolean {
  if (!permissionCodes) {
    return false
  }

  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions]

  if (requiredPermissions.length === 0) {
    return false
  }

  const isGranted = (permission: string) => permissionCodes.includes(permission)

  return mode === 'any'
    ? requiredPermissions.some(isGranted)
    : requiredPermissions.every(isGranted)
}
