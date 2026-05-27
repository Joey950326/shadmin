import { cn } from '@/lib/utils'
import HeaderLeftBar from './HeaderLeftBar'
import HeaderRightBar from './HeaderRightBar'

interface HeaderProps {
  className?: string
  showLogo?: boolean
}

export default function Header({ className, showLogo = false }: HeaderProps) {
  return (
    <header className={cn('h-16 w-full border-b bg-card px-2 flex items-center justify-between', className)}>
      <HeaderLeftBar showLogo={showLogo} />
      <HeaderRightBar />
    </header>
  )
}
