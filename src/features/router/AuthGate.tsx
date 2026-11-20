import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { useAppSelector } from '@/store/hooks'
import { selectIsManualLogout, selectToken } from '@/store/modules/user'

interface AuthGateProps {
  children: React.ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const token = useAppSelector(selectToken)
  const isManualLogout = useAppSelector(selectIsManualLogout)
  const hasToken = !!token

  //   console.log('locaiton:', location.pathname, 'hasToken:', hasToken, 'isManualLogout:', isManualLogout) // Debug log for location and token presence

  if (!hasToken) {
    const redirectPath = `/auth/login?redirect=${encodeURIComponent(location.pathname)}`
    if (!isManualLogout) {
      toast.error(t('auth:login.loginRequiredToAccess'), { position: 'top-center', id: 'auth-gate' })
    }
    return <Navigate to={redirectPath} replace />
  }
  if (searchParams.get('redirect')) {
    toast.success(t('auth:login.redirecting'), { position: 'top-center', id: 'auth-gate-redirect' })
    return <Navigate to={searchParams.get('redirect')!} />
  }
  return <>{children}</>
}
