import type { Ref } from 'react'
import type { Api } from '@/services/api/types/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import AvatarUpload from './AvatarUpload'

function createFormSchema(t: (key: string) => string) {
  return z.object({
    avatar: z.url(t('table.formValidation.avatarRequired')),
    username: z.string().min(2, t('table.formValidation.usernameMin')).max(20, t('table.formValidation.usernameMax')),
    gender: z.number().refine(val => ['1', '2'].includes(val.toString()), t('table.formValidation.genderInvalid')),
    idCard: z.string(t('table.formValidation.idCardRequired'))
      .trim()
      .refine(val => /^[0-9X]{15}$|^[0-9X]{18}$/i.test(val), {
        message: t('table.formValidation.idCardInvalid'),
      }),
    email: z.email(t('table.formValidation.emailInvalid')),
    address: z.string().trim().min(4, t('table.formValidation.addressMin')).max(30, t('table.formValidation.addressMax')),
  })
}

type ValueType = z.infer<ReturnType<typeof createFormSchema>>

export interface UserInfoFormRef {
  getValues: () => ValueType
  reset: (value?: ValueType) => void
  trigger: () => Promise<boolean>
}

interface UserInfoFormProps {
  value: Api.User.UserInfo | null
  onValueChange?: (val: Api.User.UserInfo) => void
  className?: string
  canEdit?: boolean
  disabled?: boolean // 是否禁用表单编辑，只做展示用途
  ref: Ref<UserInfoFormRef>
  onComfirmStatusChange?: (val: boolean) => void
}

export default function UserInfoForm({ value, onValueChange, className, ref, disabled, onComfirmStatusChange }: UserInfoFormProps) {
  const { t } = useTranslation()
  const formSchema = useMemo(() => createFormSchema(t), [t])
  const defaultForm: ValueType = {
    avatar: '',
    username: '',
    gender: 1,
    idCard: '',
    email: '',
    address: '',
    ...value,
  }
  const form = useForm<ValueType>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultForm,
    mode: 'onChange',
  })

  const [isAvatarUploading, setIsAvatarUploading] = useState<boolean>(false)

  const [isFormChange, setIsFormChange] = useState<boolean>(false)

  const handleChange = (val: Api.User.UserInfo) => {
    setIsFormChange(true)
    onValueChange?.(val)
  }

  const canConfirm = useMemo(() => {
    return !disabled && !isAvatarUploading && isFormChange
  }, [disabled, isAvatarUploading, isFormChange])

  useEffect(() => {
    onComfirmStatusChange?.(canConfirm)
  }, [canConfirm, onComfirmStatusChange])

  useImperativeHandle(ref, () => ({
    getValues: () => form.getValues(),
    reset: (value?: ValueType) => { form.reset(value) },
    trigger: () => form.trigger(),
  }), [form])

  return (
    <form
      id="edit-user-form"
      className={cn(
        'flex flex-col gap-2',
        className,
      )}
      onChange={e => handleChange(e.target.value)}
    >
      <Controller
        name="avatar"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="w-20">
            <FieldLabel htmlFor="avatar">
              {t('table.userAvatar')}
            </FieldLabel>
            <AvatarUpload
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
              onUploadingChange={setIsAvatarUploading}
            />
            {
              fieldState.invalid && (<FieldError errors={[fieldState.error]} />)
            }

          </Field>
        )}
      />

      <Controller
        name="username"
        control={form.control}
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.error}>
              <FieldLabel htmlFor="username">
                {t('table.username')}
              </FieldLabel>
              <Input
                id="username"
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={t('table.inputUsername')}
                autoComplete="off"
                autoFocus={false}
                disabled={disabled}
              />

              {
                fieldState.invalid && (<FieldError errors={[fieldState.error]} />)
              }

            </Field>
          )
        }}
      />
      <Controller
        name="gender"
        control={form.control}
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.error}>
              <FieldLabel htmlFor="gender">
                {t('table.gender')}
              </FieldLabel>
              <Select
                name={field.name}
                value={field.value.toString()}
                onValueChange={val => field.onChange(Number(val))}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('table.selectGender')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">{t('table.maleTitle')}</SelectItem>
                    <SelectItem value="2">{t('table.femaleTitle')}</SelectItem>
                  </SelectGroup>

                </SelectContent>
              </Select>
              {
                fieldState.invalid && (<FieldError errors={[fieldState.error]} />)
              }

            </Field>
          )
        }}
      />
      <Controller
        name="idCard"
        control={form.control}
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.error}>
              <FieldLabel htmlFor="idCard">
                {t('table.idCard')}
              </FieldLabel>
              <Input
                id="idCard"
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={t('table.inputIdCard')}
                autoComplete="off"
                autoFocus={false}
                disabled={disabled}
              />

              {
                fieldState.invalid && (<FieldError errors={[fieldState.error]} />)
              }
            </Field>
          )
        }}
      />
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.error}>
              <FieldLabel htmlFor="email">
                {t('table.email')}
              </FieldLabel>
              <Input
                id="email"
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={t('table.inputEmail')}
                autoComplete="off"
                autoFocus={false}
                disabled={disabled}
              />

              {
                fieldState.invalid && (<FieldError errors={[fieldState.error]} />)
              }
            </Field>
          )
        }}
      />
      <Controller
        name="address"
        control={form.control}
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.error}>
              <FieldLabel htmlFor="address">
                {t('table.address')}
              </FieldLabel>
              <Input
                id="address"
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={t('table.inputAddress')}
                autoComplete="off"
                autoFocus={false}
                disabled={disabled}
              />

              {
                fieldState.invalid && (<FieldError errors={[fieldState.error]} />)
              }
            </Field>
          )
        }}
      />
    </form>
  )
}
