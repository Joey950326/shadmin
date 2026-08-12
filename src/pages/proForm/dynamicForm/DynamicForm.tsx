import type { Ref } from 'react'
import type { FormSchemaType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { XIcon } from 'lucide-react'
import { memo, useCallback, useEffect, useImperativeHandle } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { formSchema } from './schema'

export interface DynamicFormRefDef {
  getFormData: () => Promise<FormSchemaType | null>
  reset: () => void
}

interface DynamicFormProps {
  ref: Ref<DynamicFormRefDef | null>
  value?: FormSchemaType
  onValueChange?: (val: FormSchemaType) => void
}

const DEFAULT_FORM_VALUE = {
  name: '',
  emails: [{ address: '' }],
  phones: [{ number: '' }],
}

function DynamicFormCmp({ ref, value, onValueChange }: DynamicFormProps) {
  const { t } = useTranslation()
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_FORM_VALUE,
  })

  const { fields: emailsFields, append: emailAppend, remove: emailRemove } = useFieldArray({
    control: form.control,
    name: 'emails',
  })

  const { fields: phoneFields, append: phoneAppend, remove: phoneRemove } = useFieldArray({
    control: form.control,
    name: 'phones',
  })

  const handleFormChange = useCallback(() => {
    const val = form.getValues()
    onValueChange?.(val)
  }, [form, onValueChange])

  useImperativeHandle(ref, () => ({
    getFormData: async () => {
      const isValid = await form.trigger()
      if (isValid) {
        return form.getValues()
      }
      return null
    },
    reset: () => {
      form.reset()
    },
  }), [form])

  useEffect(() => {
    if (value) {
      form.setValues(value)
    }
  }, [form, value])

  return (
    <form id="form-rhf-array" onChange={handleFormChange}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-name">
                {t('form.username')}
              </FieldLabel>
              <Input
                {...field}
                id="form-name"
                aria-invalid={fieldState.invalid}
                placeholder={t('form.inputUsername')}
                autoComplete="off"
                className="max-w-md"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        {/* 手机号 */}
        <FieldSet className="gap-4">
          <FieldLegend variant="label">{t('form.phone')}</FieldLegend>
          <FieldDescription>
            {t('form.phoneDescription')}
          </FieldDescription>
          {/* 动态手机号 */}
          <FieldGroup className="gap-4">
            {phoneFields.map((field, index) => (
              <Controller
                key={field.id}
                name={`phones.${index}.number`}
                control={form.control}
                render={({ field: controllerField, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                    className="max-w-md"
                  >
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          {...controllerField}
                          id={`form-phones-${index}`}
                          aria-invalid={fieldState.invalid}
                          placeholder={t('form.inputPhone')}
                        />
                        {phoneFields.length > 1 && (
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => phoneRemove(index)}
                              aria-label={`${t('form.phone')} ${index + 1}`}
                            >
                              <XIcon />
                            </InputGroupButton>
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => phoneAppend({ number: '' })}
              disabled={phoneFields.length >= 5}
              className="max-w-md"
            >
              {t('form.addPhone')}
            </Button>
            {form.formState.errors.emails?.root && (
              <FieldError errors={[form.formState.errors.emails.root]} />
            )}
          </FieldGroup>
        </FieldSet>

        {/* 邮箱 */}
        <FieldSet className="gap-4">
          <FieldLegend variant="label">{t('form.email')}</FieldLegend>
          <FieldDescription>
            {t('form.emailDescription')}
          </FieldDescription>
          {/* 动态邮箱 */}
          <FieldGroup className="gap-4">
            {emailsFields.map((field, index) => (
              <Controller
                key={field.id}
                name={`emails.${index}.address`}
                control={form.control}
                render={({ field: controllerField, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                    className="max-w-md"
                  >
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          {...controllerField}
                          id={`form-emails-${index}`}
                          aria-invalid={fieldState.invalid}
                          placeholder={t('form.inputEmailAddress')}
                          type="email"
                          autoComplete="email"
                        />
                        {emailsFields.length > 1 && (
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => emailRemove(index)}
                              aria-label={`${t('form.email')} ${index + 1}`}
                            >
                              <XIcon />
                            </InputGroupButton>
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => emailAppend({ address: '' })}
              disabled={emailsFields.length >= 5}
              className="max-w-md"
            >
              {t('form.addEmail')}
            </Button>
            {form.formState.errors.emails?.root && (
              <FieldError errors={[form.formState.errors.emails.root]} />
            )}
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </form>

  )
}

export default memo(DynamicFormCmp)
