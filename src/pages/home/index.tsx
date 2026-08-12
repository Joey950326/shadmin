import { useTranslation } from 'react-i18next'
import svgSrc from '@/assets/local-svg/home-welcome.svg'

function HomePage() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center size-full">
      <object data={svgSrc} type="image/svg+xml" className="size-[80%]" />
      <div className="text-2xl font-bold">{t('home.welcome')}</div>
    </div>
  )
}

export default HomePage
