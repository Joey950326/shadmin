import type { ReactNode } from 'react'
import type { CanMode } from './canPermission'
import useCurrentUserPermissions from '@/hooks/useCurrentUserPermissions'
import { hasPermission } from './canPermission'

interface CanProps {
  permission: string | string[]
  mode?: CanMode
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
}

export default function Can({
  permission,
  mode = 'all',
  children,
  fallback = null,
  loadingFallback = null,
  errorFallback = null,
}: CanProps) {
  const { data: permissionCodes, isLoading, isError } = useCurrentUserPermissions()

  if (isLoading) {
    return <>{loadingFallback}</>
  }

  if (isError) {
    return <>{errorFallback}</>
  }

  if (!hasPermission(permissionCodes, permission, mode)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
