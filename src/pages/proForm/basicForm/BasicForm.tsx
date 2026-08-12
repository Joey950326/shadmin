import type { Ref } from 'react'
import { memo, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export interface BasicFormType {
  name: string
  email: string
  age: number | string
  gender: 1 | 2 | string
  status: boolean

}

export interface BasicFormRefDef {
  getFormData: () => BasicFormType
  reset: () => void
}

interface BasicFormProps {
  ref: Ref<BasicFormRefDef | null>
  value?: BasicFormType
  onValueChange?: (val: BasicFormType) => void
}

const DEFAULT_FORM_VALUE = {
  name: '',
  email: '',
  age: '',
  gender: '',
  status: true,

}

function BasicFormCmp({ ref, value, onValueChange }: BasicFormProps) {
  const { t } = useTranslation()
  const [innerFormData, setInnerFormData] = useState<BasicFormType>(() => ({ ...DEFAULT_FORM_VALUE, ...value }))

  const handleFormChange = useCallback((val: Partial<BasicFormType>) => {
    setInnerFormData((prev) => {
      const next = { ...prev, ...val }
      onValueChange?.(next)
      return next
    })
  }, [onValueChange])

  useImperativeHandle(ref, () => ({
    getFormData: () => innerFormData,
    reset: () => {
      setInnerFormData(DEFAULT_FORM_VALUE)
    },
  }), [innerFormData])

  useEffect(() => {
    if (value)
      setInnerFormData(prev => ({ ...prev, ...value }))
  }, [value])

  return (
    <FieldGroup className="gap-4">
      {/* username */}
      <Field>
        <FieldLabel htmlFor="form-name">{t('form.username')}</FieldLabel>
        <Input className="max-w-lg" value={innerFormData.name} onChange={e => handleFormChange({ name: e.target.value })} id="form-name" placeholder={t('form.inputUsername')} />
      </Field>
      {/* email */}
      <Field>
        <FieldLabel htmlFor="form-email">{t('form.email')}</FieldLabel>
        <Input
          id="fomr-email"
          type="email"
          placeholder={t('form.inputEmail')}
          className="max-w-lg"
          value={innerFormData.email}
          onChange={e => handleFormChange({ email: e.target.value })}
        />
        <FieldDescription className="text-muted-foreground italic pl-2 text-xs">
          {t('form.uniqueEmail')}
        </FieldDescription>
      </Field>
      {/* age */}
      <Field>
        <FieldLabel htmlFor="form-age">{t('form.age')}</FieldLabel>
        <Input
          placeholder={t('form.inputAge')}
          max={120}
          min={0}
          value={innerFormData.age}
          onChange={e => handleFormChange({ age: Number(e.target.value) })}
          id="form-age"
          type="number"
          className="max-w-32"
        >
        </Input>
      </Field>
      {/* gender */}
      <Field>
        <FieldLabel htmlFor="form-age">{t('form.gender')}</FieldLabel>
        <Select value={innerFormData.gender.toString()} onValueChange={val => handleFormChange({ gender: val })}>
          <SelectTrigger className="max-w-48">
            <SelectValue placeholder={t('form.selectGender')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="male">{t('form.male')}</SelectItem>
              <SelectItem value="female">{t('form.female')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      {/* status */}
      <Field>
        <FieldLabel htmlFor="form-status">{t('form.enabledStatus')}</FieldLabel>
        <Switch checked={innerFormData.status} onCheckedChange={val => handleFormChange({ status: val })} disabled></Switch>
        <FieldDescription className="text-xs italic">
          {t('form.statusEnabledByDefault')}
        </FieldDescription>
      </Field>
    </FieldGroup>

  )
}

export default memo(BasicFormCmp)
