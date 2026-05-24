import { PanelLeftOpenIcon, PanelRightOpenIcon } from 'lucide-react'
import AvatarDropdown from '@/components/AvatarDropdown'
import FullscreenButton from '@/components/FullscreenButton'
import SettingSheet from '@/components/settingSheet'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import LanguageDropMenu from '@/features/lang/LanguageDropMenu'
import ThemeToggler from '@/features/theme/ThemeToggle'
import Breadcrumb from './Breadcrumb'

export default function Header() {
  const { toggleSidebar, open } = useSidebar()
  return (
    <header className="h-16 border-b bg-card px-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={toggleSidebar}>
          {open ? <PanelRightOpenIcon /> : <PanelLeftOpenIcon />}
        </Button>

        <Breadcrumb />
      </div>

      <div className="flex items-center gap-2">
        <FullscreenButton />
        <LanguageDropMenu />
        <ThemeToggler />
        <SettingSheet />
        <AvatarDropdown />
      </div>
    </header>
  )
}
