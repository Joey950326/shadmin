import { Navigate, useLocation, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { useAppSelector } from '@/store/hooks'
import { selectIsManualLogout, selectToken } from '@/store/modules/user'

interface AuthGateProps {
  children: React.ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const token = useAppSelector(selectToken)
  const isManualLogout = useAppSelector(selectIsManualLogout)
  const hasToken = !!token

  //   console.log('locaiton:', location.pathname, 'hasToken:', hasToken, 'isManualLogout:', isManualLogout) // Debug log for location and token presence

  if (!hasToken) {
    const redirectPath = `/auth/login?redirect=${encodeURIComponent(location.pathname)}`
    if (!isManualLogout) {
      toast.error('您需要登录才能访问此页面', { position: 'top-center', id: 'auth-gate' })
    }
    return <Navigate to={redirectPath} replace />
  }
  if (searchParams.get('redirect')) {
    toast.success('正在跳转...', { position: 'top-center', id: 'auth-gate-redirect' })
    return <Navigate to={searchParams.get('redirect')!} />
  }
  return <>{children}</>
}
