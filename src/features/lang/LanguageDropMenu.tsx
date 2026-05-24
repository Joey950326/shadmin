import { LanguagesIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { appActions, appSelectors } from '@/store/modules/app'
import { DEFAULT_LANGUAGE, LANGUAGE_RECORDS } from './config'

import i18n from './index'

interface LanguageDropMenuProps {
  buttonClassName?: string
}

export default function LanguageDropMenu({ buttonClassName }: LanguageDropMenuProps) {
  const dispatch = useAppDispatch()
  const [currentLanguage, setCurrentLanguage] = useState(useAppSelector(appSelectors.selectLanguage) || i18n.language || DEFAULT_LANGUAGE)
  const { t } = useTranslation()
  useEffect(() => {
    dispatch(appActions.setLanguage(currentLanguage))
  }, [currentLanguage, dispatch])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={buttonClassName}>
          <LanguagesIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-24 hover:shadow-2xl transition-shadow duration-300">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('changeLanguage')}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentLanguage}
            onValueChange={setCurrentLanguage}
          >
            {LANGUAGE_RECORDS.map(lang => (
              <DropdownMenuRadioItem key={lang.code} value={lang.code}>
                {lang.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
