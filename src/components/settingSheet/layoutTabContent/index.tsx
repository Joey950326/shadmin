import type { LayoutType } from '@/store/modules/app'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

import { setAppState } from '@/store/modules/app'
import LayoutBox from './LayoutBox'
import TabSwitcher from './TabSwitcher'

export default function LayoutContent() {
  const { t } = useTranslation()
  const mode = useAppSelector(state => state.app.layout)

  const dispatch = useAppDispatch()

  const handleModeChange = (newMode: LayoutType) => {
    dispatch(setAppState({ layout: newMode }))
  }

  return (
    <FieldGroup className="h-full max-w-sm">
      <Card className="box-border w-full border shadow-none">
        <CardHeader>
          <CardTitle>{t('settings.layout')}</CardTitle>
          <CardDescription>{t('settings.layoutDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LayoutBox className="w-full h-36 sm:h-32" mode={mode} onModeChange={handleModeChange} />
        </CardContent>
      </Card>
      <FieldLabel htmlFor="tab-switch">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>{t('settings.pageTabs')}</FieldTitle>
            <FieldDescription>
              {t('settings.pageTabsDescription')}
            </FieldDescription>
          </FieldContent>
          <TabSwitcher id="tab-switch" />
        </Field>
      </FieldLabel>
    </FieldGroup>
  )
}
