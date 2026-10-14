import useMenu from '@/hooks/useMenu'
import Logo from '@/layout/components/Logo'
import TopNavBar from '@/layout/components/topNavBar'
import { cn } from '@/lib/utils'
import HeaderRightBar from '../../components/HeaderRightBar'
// import HeaderLeftBar from './HeaderLeftBar'

interface HeaderProps {
  className?: string
}

export default function Header({ className }: HeaderProps) {
  const { menuData: menuItems } = useMenu()
  return (
    <header className={cn('h-16 w-full flex flex-row items-center px-2 z-10', className)}>
      <Logo className="min-w-0 shrink-0" />
      <div className="flex-1 h-full relative">
        {/* <NavMenu menuItems={menuItems} className="absolute inset-0 pr-4" /> */}
        <TopNavBar menuItems={menuItems} className="absolute inset-0 pr-4" onMenuClick={() => {}} />
      </div>
      <HeaderRightBar className="min-w-0 shrink-0" />
    </header>
  )
}
