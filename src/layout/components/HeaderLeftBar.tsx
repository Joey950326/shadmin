import { PanelLeftOpenIcon, PanelRightOpenIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Logo from '@/assets/react.svg'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import Breadcrumb from './Breadcrumb'

interface HeaderLeftBarProps {
  className?: string
  showLogo?: boolean
}

export default function HeaderLeftBar({ className, showLogo }: HeaderLeftBarProps) {
  const { toggleSidebar, open } = useSidebar()
  const { t } = useTranslation()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLogo && (
        <div className="hidden md:block h-full md:flex items-center gap-2 pr-4">
          <object className="w-8 h-8" data={Logo} type="image/svg+xml" />
          <span className="text-xl font-semibold overflow-hidden">{t('appTitle')}</span>
        </div>
      )}
      <Button size="icon" variant="ghost" onClick={toggleSidebar} className="pr-2">
        {open ? <PanelRightOpenIcon /> : <PanelLeftOpenIcon />}
      </Button>

      <Breadcrumb />
    </div>
  )
}
