import { Navigate } from 'react-router'
import useMenu from '@/hooks/useMenu'

interface AuthorizedRouteGateProps {
  children: React.ReactNode
}

export default function AuthorizedRouteGate({ children }: AuthorizedRouteGateProps) {
  const { currentRouteAuthorized, isLoading, hasError } = useMenu()

  if (isLoading) {
    return null
  }

  if (hasError || currentRouteAuthorized === false) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
