import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import illustrationSrc from '@/assets/local-svg/500.svg'
import { Button } from '@/components/ui/button'
import StatusPage from '@/pages/error/StatusPage'

function Expection500() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <StatusPage
      illustration={illustrationSrc}
      title={t('serverError.title')}
      description={t('serverError.description')}
    >
      <>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw data-icon="inline-start" />
          {t('serverError.retry')}
        </Button>
        <Button variant="outline" onClick={() => navigate('/home/index')}>
          {t('serverError.backHome')}
        </Button>
      </>
    </StatusPage>
  )
}

export default Expection500
