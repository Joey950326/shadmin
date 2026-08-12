import { useTranslation } from 'react-i18next'
import ThemeButtonGroups from '@/features/theme/ThemeToggleGroups'
import { cn } from '@/lib/utils'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from '../ui/field'
import GraySwitcher from './GraySwitcher'
import PresetColorToggle from './presetColorToggle'
import WeakSwitcher from './WeakSwitcher'

interface ThemeTabContentProps {
  className?: string
}

export default function ThemeTabContent({ className }: ThemeTabContentProps) {
  const { t } = useTranslation()
  return (
    <FieldGroup className={cn('h-full max-w-sm', className)}>
      <FieldLabel htmlFor="switch-theme-mode">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>{t('settings.darkMode')}</FieldTitle>
            <FieldDescription>
              {t('settings.darkModeDescription')}
            </FieldDescription>
          </FieldContent>
          {/* <Switch id="switch-share" /> */}
          <ThemeButtonGroups />
        </Field>
      </FieldLabel>

      <FieldLabel htmlFor="toggle-theme">
        <Field>
          <FieldContent>
            <FieldTitle>{t('settings.themeColor')}</FieldTitle>
            <FieldDescription>
              {t('settings.themeColorDescription')}
            </FieldDescription>
          </FieldContent>
          <PresetColorToggle id="toggle-theme" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="switch-gray-mode">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>{t('settings.grayMode')}</FieldTitle>
            <FieldDescription>
              {t('settings.grayModeDescription')}
            </FieldDescription>
          </FieldContent>
          {/* <Switch id="switch-gray-mode" /> */}
          <GraySwitcher id="switch-gray-mode" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="switch-notifications">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>{t('settings.colorWeakMode')}</FieldTitle>
            <FieldDescription>
              {t('settings.colorWeakModeDescription')}
            </FieldDescription>
          </FieldContent>
          <WeakSwitcher id="switch-notifications" />
        </Field>
      </FieldLabel>

    </FieldGroup>
  )
}
