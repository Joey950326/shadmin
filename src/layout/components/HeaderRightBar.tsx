import AvatarDropdown from '@/components/AvatarDropdown'
import FullscreenButton from '@/components/FullscreenButton'
import SettingSheet from '@/components/settingSheet'
import LanguageDropMenu from '@/features/lang/LanguageDropMenu'
import ThemeToggler from '@/features/theme/ThemeToggle'
import { cn } from '@/lib/utils'

interface HeaderRightBarProps {
  className?: string
}

export default function HeaderRightBar({ className }: HeaderRightBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <FullscreenButton />
      <LanguageDropMenu />
      <ThemeToggler />
      <SettingSheet />
      <AvatarDropdown />
    </div>
  )
}
