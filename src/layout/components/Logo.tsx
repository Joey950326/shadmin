import { useTranslation } from 'react-i18next'
import logoSvg from '@/assets/react.svg'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showTitle?: boolean
  showLogo?: boolean
  open?: boolean
}

export default function Logo({ className, showTitle = true, showLogo = true, open = true }: LogoProps) {
  const { t } = useTranslation()
  return (
    <div className={cn('hidden md:block h-full md:flex items-center gap-2 overflow-hidden', className)}>
      {showLogo && (
        <object className="w-8 h-8" data={logoSvg} type="image/svg+xml" />
      )}
      {showTitle && (
        <span className="text-xl font-semibold overflow-hidden">{open ? t('appTitle') : t('appTitle').slice(0, 1)}</span>
      )}
    </div>
  )
}
