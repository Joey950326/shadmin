import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import illustrationSrc from '@/assets/local-svg/403.svg'
import { Button } from '@/components/ui/button'
import StatusPage from '@/pages/error/StatusPage'

function Expection403() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <StatusPage
      illustration={illustrationSrc}
      title={t('forbidden.title')}
      description={t('forbidden.description')}
    >
      <Button onClick={() => navigate('/home/index')}>
        {t('forbidden.backHome')}
      </Button>
    </StatusPage>
  )
}

export default Expection403
