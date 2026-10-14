import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import svgSrc from '@/assets/local-svg/404.svg'
import { Button } from '@/components/ui/button'

function Expection404() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 p-6 text-center">
      <object
        data={svgSrc}
        type="image/svg+xml"
        aria-hidden="true"
        className="h-auto w-full max-w-[28rem]"
      />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t('notFound.title')}</h1>
        <p className="text-muted-foreground">{t('notFound.description')}</p>
      </div>
      <Button onClick={() => navigate('/home/index')}>
        {t('notFound.backHome')}
      </Button>
    </div>
  )
}

export default Expection404
