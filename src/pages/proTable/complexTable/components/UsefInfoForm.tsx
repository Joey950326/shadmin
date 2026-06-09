import type { Ref } from 'react'
import type { Api } from '@/services/api/types/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import AvatarUpload from './AvatarUpload'

const formSchema = z.object({
  avatar: z.url('请上传头像'),
  username: z.string().min(2, '用户名至少为4位字符').max(20, '用户名不能超过20个字符'),
  gender: z.number().refine(val => ['1', '2'].includes(val.toString()), '性别只能为男/女'),
  idCard: z.string('身份证号码不能为空，且必须为字符串')
    .trim()
    .refine(val => /^[0-9X]{15}$|^[0-9X]{18}$/i.test(val), {
      message: '身份证号码格式不正确（应为15位或18位）',
    }),
  email: z.email('请输入正确的邮箱格式'),
  address: z.string().trim().min(4, '地址字数不少于4个字符').max(30, '地址字数不超过30个字符'),
})

type ValueType = z.infer<typeof formSchema>

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
  const defaultForm: z.infer<typeof formSchema> = {
    avatar: '',
    username: '',
    gender: 1,
    idCard: '',
    email: '',
    address: '',
    ...value,
  }
  const form = useForm<z.infer<typeof formSchema>>({
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
              用户头像
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
                用户名
              </FieldLabel>
              <Input
                id="username"
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="请输入用户名"
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
                性别
              </FieldLabel>
              <Select
                name={field.name}
                value={field.value.toString()}
                onValueChange={val => field.onChange(Number(val))}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">男士</SelectItem>
                    <SelectItem value="2">女士</SelectItem>
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
                用户名
              </FieldLabel>
              <Input
                id="idCard"
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="请输入身份证"
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
                邮箱
              </FieldLabel>
              <Input
                id="email"
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="请输入邮箱"
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
                邮箱
              </FieldLabel>
              <Input
                id="address"
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="请输入地址"
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
