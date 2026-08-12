import type { Ref } from 'react'
import type { FormDataType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useImperativeHandle, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { DatePicker, DatetimePicker, TimePicker as TimePickerCmp } from '@/components/datetimePicker'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { getNow } from '@/utils'
import { ActivityZoneValue, createFormSchema } from './schema'

export interface BasicFormRefDef {
  getFormData: () => Promise<FormDataType | null>
  reset: () => void
}

interface BasicFormCmpProps {
  id?: string
  ref: Ref<BasicFormRefDef>
  value?: FormDataType
  onConfirm?: (val: FormDataType) => void
}

function BasicFormCmp({ id, ref, value }: BasicFormCmpProps) {
  const { t } = useTranslation()
  const formSchema = useMemo(() => createFormSchema(t), [t])
  const form = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityName: '',
      activityZone: '' as FormDataType['activityZone'],
      activityTime: getNow() as Date,
      instantDelivery: false,
      activityType: [],
      resource: [],
      activityDescription: '',
      ...value,
    },
  })

  useImperativeHandle(ref, () => (
    {
      getFormData: async () => {
        const isValid = await form.trigger()
        if (isValid) {
          return form.getValues()
        }
        return null
      },
      reset: () => form.reset(),
    }
  ), [form])

  return (
    <form id={id} className="size-full pb-2">
      <FieldGroup>
        {/* 活动名称 */}
        <Controller
          name="activityName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <Label htmlFor="form-activityName" className="min-w-16">
                {t('form.activityName')}
              </Label>
              <Input
                {...field}
                className="max-w-xl"
                id="form-activityName"
                aria-invalid={fieldState.invalid}
                placeholder={t('form.inputActivityName')}
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        {/* 活动范围 */}
        <Controller
          name="activityZone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <Label htmlFor="form-activityZone" className="min-w-16">
                {t('form.activityZone')}
              </Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder={t('form.selectActivityZone')} />
                </SelectTrigger>
                <SelectContent className="p-2">
                  {ActivityZoneValue.map(v => (
                    <SelectItem key={v} value={v}>{t(`form.${v === 'zone one' ? 'zoneOne' : 'zoneTwo'}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* 活动时间 */}
        {/* TODO 新建一个时间日期选中组件 */}
        <Controller
          name="activityTime"
          control={form.control}
          render={({ field, fieldState }) => {
            return (
              <Field data-invalid={fieldState.invalid} orientation="horizontal">
                <Label htmlFor="form-activityTime" className="min-w-16">
                  {t('form.activityTime')}
                </Label>
                <DatetimePicker value={field.value} onValueChange={field.onChange}>
                  <TimePickerCmp />
                  <DatePicker />
                </DatetimePicker>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )
          }}
        />

        {/* 活动通知 */}
        <Controller
          name="instantDelivery"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <Label htmlFor="form-instantDelivery">
                {t('form.activityNotification')}
              </Label>
              <div className="flex items-center space-x-2">
                <Switch id="form-instantDelivery" checked={field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="form-instantDelivery">{t('form.enable')}</Label>
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* 活动类型 */}
        <Controller
          name="activityType"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <Label htmlFor="form-activityType" className="min-w-16">
                {t('form.activityType')}
              </Label>
              <ToggleGroup value={field.value} onValueChange={field.onChange} variant="outline" type="multiple">
                <ToggleGroupItem className="data-[state=on]:bg-primary/20" value="online" aria-label={t('form.onlineActivity')}>
                  {t('form.onlineActivity')}
                </ToggleGroupItem>
                <ToggleGroupItem className="data-[state=on]:bg-primary/20" value="offline" aria-label={t('form.offlineActivity')}>
                  {t('form.offlineActivity')}
                </ToggleGroupItem>
                <ToggleGroupItem className="data-[state=on]:bg-primary/20" value="promotion" aria-label={t('form.promotionActivity')}>
                  {t('form.promotionActivity')}
                </ToggleGroupItem>
              </ToggleGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* 活动资源 */}
        <Controller
          name="resource"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <Label htmlFor="form-resource" className="min-w-16">
                {t('form.activityResource')}
              </Label>
              <ToggleGroup value={field.value} onValueChange={field.onChange} variant="outline" type="multiple">
                <ToggleGroupItem className="data-[state=on]:bg-primary/20" value="sponsor" aria-label={t('form.sponsor')}>
                  {t('form.sponsor')}
                </ToggleGroupItem>
                <ToggleGroupItem className="data-[state=on]:bg-primary/20" value="venue" aria-label={t('form.venue')}>
                  {t('form.venue')}
                </ToggleGroupItem>

              </ToggleGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* 活动描述 */}
        <Controller
          name="activityDescription"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <Label htmlFor="form-activityDescription" className="min-w-16">
                {t('form.activityDescription')}
              </Label>
              <Textarea
                {...field}
                className="max-w-xl"
                id="form-activityDescription"
                aria-invalid={fieldState.invalid}
                placeholder={t('form.inputActivityDescription')}
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

      </FieldGroup>
    </form>

  )
}

export default BasicFormCmp
