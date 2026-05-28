import { PanelLeftOpenIcon, PanelRightOpenIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import Breadcrumb from './Breadcrumb'
import Logo from './Logo'

interface HeaderLeftBarProps {
  className?: string
  showLogo?: boolean
}

export default function HeaderLeftBar({ className, showLogo }: HeaderLeftBarProps) {
  const { toggleSidebar, open } = useSidebar()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLogo && <Logo />}
      <Button size="icon" variant="ghost" onClick={toggleSidebar} className="pr-2">
        {open ? <PanelRightOpenIcon /> : <PanelLeftOpenIcon />}
      </Button>

      <Breadcrumb />
    </div>
  )
}
