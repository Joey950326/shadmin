import type { ReactNode } from 'react'
import type { avatarRefDef } from './AvatarUpload'
import type { Api } from '@/services/api/types/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AvatarUpload from './AvatarUpload'

interface EditActionCellPros {
  userInfo: Api.User.UserInfo | null
  onEdit?: (data: Api.User.UserInfo, cb?: () => void) => void
  children?: ReactNode
  className?: string
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  onAvatarUpload?: (data: Api.User.AvatarUploadParams, successCb?: (data: Api.User.AvatarUploadResponse) => void, failCb?: (error: Error) => void) => void
}

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

function EditActionCell({ userInfo, children, visible, onVisibleChange, onEdit, onAvatarUpload }: EditActionCellPros) {
  const { t } = useTranslation()
  const formSchema = useMemo(() => createFormSchema(t), [t])
  const defaultForm: z.infer<typeof formSchema> = {
    avatar: '',
    username: '',
    gender: 1,
    idCard: '',
    email: '',
    address: '',
    ...userInfo,
  }

  const [dialogOpen, setDialogOpen] = useState<boolean>(visible ?? false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultForm,
  })

  const isFormChange = useMemo(() => form.formState.isDirty, [form.formState.isDirty])

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    // 进行校验
    const isValid = await form.trigger()
    if (isValid) {
      const submitData = Object.assign({}, userInfo, data)
      onEdit?.(submitData, () => setDialogOpen(false))
    }
  }

  const handleDialogChange = useCallback((visible: boolean) => {
    if (!visible) {
      form.reset()
    }
    setDialogOpen(visible)
    onVisibleChange?.(visible)
  }, [form, onVisibleChange])

  const avatarRef = useRef<avatarRefDef>(null)

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
      {children && (
        <DialogTrigger asChild>
          {children }
        </DialogTrigger>
      )}
      {userInfo
        ? (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('table.editUser')}</DialogTitle>
                <DialogDescription>{t('table.userInfoDescription')}</DialogDescription>
              </DialogHeader>
              <form
                id="edit-user-form"
                className="flex flex-col gap-2"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <Controller
                  name="avatar"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="w-20">
                      <FieldLabel htmlFor="avatar">
                        {t('table.userAvatar')}
                      </FieldLabel>
                      <AvatarUpload
                        ref={avatarRef}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAvatarUpload={onAvatarUpload}
                      />

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
                        />

                        {
                          fieldState.invalid && (<FieldError errors={[fieldState.error]} />)
                        }
                      </Field>
                    )
                  }}
                />
              </form>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">{t('cancel')}</Button>
                </DialogClose>
                <Button type="submit" form="edit-user-form" disabled={avatarRef?.current?.isUploading || !isFormChange}>{t('confirm')}</Button>
              </DialogFooter>
            </DialogContent>
          )
        : (
            <div className="size-full flex items-center justify-center">{t('table.noUserInfo')}</div>
          )}
    </Dialog>
  )
}

export default memo(EditActionCell)
