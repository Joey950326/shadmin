import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAppState } from '@/store/modules/app'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from '../ui/field'
import { Switch } from '../ui/switch'

interface OtherTabContentProps {
  className?: string
}

export default function OtherTabContent({ className }: OtherTabContentProps) {
  const { t } = useTranslation()
  const showWatermark = useAppSelector(state => state.app.showWatermark)
  const dispatch = useAppDispatch()

  const handleWatermarkChange = (checked: boolean) => {
    dispatch(setAppState({ showWatermark: checked }))
  }

  return (
    <FieldGroup className={cn('h-full max-w-sm', className)}>
      <FieldLabel htmlFor="switch-watermark">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>{t('settings.watermark')}</FieldTitle>
            <FieldDescription>
              {t('settings.watermarkDescription')}
            </FieldDescription>
          </FieldContent>
          <Switch
            id="switch-watermark"
            checked={showWatermark}
            onCheckedChange={handleWatermarkChange}
          />
        </Field>
      </FieldLabel>
    </FieldGroup>
  )
}
