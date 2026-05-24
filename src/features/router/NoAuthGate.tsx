import { Navigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { useAppSelector } from '@/store/hooks'
import { selectIsManualLogin, selectToken } from '@/store/modules/user'

interface NoAuthGateProps {
  children: React.ReactNode
}

export default function NoAuthGate({ children }: NoAuthGateProps) {
  const [searchParams] = useSearchParams()
  const token = useAppSelector(selectToken)
  const isManualLogin = useAppSelector(selectIsManualLogin)
  const hasToken = !!token

  // console.log('locaiton:', location.pathname, 'hasToken:', hasToken, 'isManualLogin:', isManualLogin) // Debug log for location and token presence
  if (hasToken) {
    const redirectPath = searchParams.get('redirect') || '/home/index'
    if (!isManualLogin) {
      toast.error('您已登录，无需访问此页面', { position: 'top-center', id: 'no-auth-gate' })
    }
    return <Navigate to={redirectPath} replace />
  }
  return <>{children}</>
}
