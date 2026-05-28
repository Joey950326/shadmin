import { useTranslation } from 'react-i18next'
import logoSvg from '@/assets/react.svg'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export default function Logo({ className }: LogoProps) {
  const { t } = useTranslation()
  return (
    <div className={cn('hidden md:block h-full md:flex items-center gap-2 pr-4', className)}>
      <object className="w-8 h-8" data={logoSvg} type="image/svg+xml" />
      <span className="text-xl font-semibold overflow-hidden">{t('appTitle')}</span>
    </div>
  )
}
