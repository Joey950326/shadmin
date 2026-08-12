import { KeyIcon, LogOutIcon, UserIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'

const defaultAvatarSrc = 'https://placehold.co/400x400/orange/white?text=T'

export default function AvatarDropdown() {
  const { logout, userInfo } = useAuth()
  const { t } = useTranslation()

  const avatarSrc = useMemo(() => {
    if (userInfo?.username) {
      const firstUsernameChar = userInfo.username.charAt(0).toUpperCase()
      return defaultAvatarSrc.replace('text=T', `text=${firstUsernameChar}`)
    }
    return defaultAvatarSrc
  }, [userInfo])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Avatar className="size-6">
            <AvatarImage src={avatarSrc} alt={t('table:avatar')} />
            <AvatarFallback>{t('table:avatar')}</AvatarFallback>
          </Avatar>
          <span className="hidden md:block">{userInfo?.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40" onCloseAutoFocus={e => e.preventDefault()}>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon />
            <span>{t('profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <KeyIcon />
            <span>{t('changePassword')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={logout}>
            <LogOutIcon />
            <span>{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
