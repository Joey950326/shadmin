import type { Ref } from 'react'
import type * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useImperativeHandle } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { DatePicker, DatetimePicker, TimePicker as TimePickerCmp } from '@/components/datetimePicker'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { getNow } from '@/utils'
import { ActivityZoneValue, formSchema } from './schema'

export interface BasicFormRefDef {
  getFormData: () => Promise<z.infer<typeof formSchema> | null>
  reset: () => void
}

interface BasicFormCmpProps {
  id?: string
  ref: Ref<BasicFormRefDef>
  value?: z.infer<typeof formSchema>
  onConfirm?: (val: z.infer<typeof formSchema>) => void
}

function BasicFormCmp({ id, ref, value }: BasicFormCmpProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityName: '',
      activityZone: '',
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
  ))
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
                活动名称
              </Label>
              <Input
                {...field}
                className="max-w-xl"
                id="form-activityName"
                aria-invalid={fieldState.invalid}
                placeholder="请输入活动名称"
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
                活动范围
              </Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="请选择活动范围" />
                </SelectTrigger>
                <SelectContent className="p-2">
                  {ActivityZoneValue.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                  活动时间
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
                活动通知
              </Label>
              <div className="flex items-center space-x-2">
                <Switch id="form-instantDelivery" checked={field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="form-instantDelivery">开启</Label>
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
                活动类型
              </Label>
              <ToggleGroup value={field.value} onValueChange={field.onChange} variant="outline" type="multiple">
                <ToggleGroupItem className="data-[state=on]:bg-primary/20" value="online" aria-label="Toggle bold">
                  在线活动
                </ToggleGroupItem>
                <ToggleGroupItem className="data-[state=on]:bg-primary/20" value="offline" aria-label="Toggle italic">
                  离线活动
                </ToggleGroupItem>
                <ToggleGroupItem className="data-[state=on]:bg-primary/20" value="promotion" aria-label="Toggle strikethrough">
                  促销活动
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
                活动资源
              </Label>
              <ToggleGroup value={field.value} onValueChange={field.onChange} variant="outline" type="multiple">
                <ToggleGroupItem className="data-[state=on]:bg-primary/20" value="sponsor" aria-label="Toggle bold">
                  赞助
                </ToggleGroupItem>
                <ToggleGroupItem className="data-[state=on]:bg-primary/20" value="venue" aria-label="Toggle italic">
                  场地
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
                活动描述
              </Label>
              <Textarea
                {...field}
                className="max-w-xl"
                id="form-activityDescription"
                aria-invalid={fieldState.invalid}
                placeholder="请输入活动描述内容"
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
