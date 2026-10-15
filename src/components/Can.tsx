import type { ReactNode } from 'react'
import useCurrentUserPermissions from '@/hooks/useCurrentUserPermissions'

interface CanProps {
  permission: string
  children: ReactNode
}

export default function Can({ permission, children }: CanProps) {
  const { data: permissionCodes, isLoading, isError } = useCurrentUserPermissions()

  if (isLoading || isError || !permissionCodes?.includes(permission)) {
    return null
  }

  return <>{children}</>
}
