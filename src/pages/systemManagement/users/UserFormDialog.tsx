import type { Api } from '@/services/api/types/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as z from 'zod'
import Can from '@/components/Can'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRoleOptions } from '@/services/api/hooks/useRole'
import { useAddtUser, useEditUser } from '@/services/api/hooks/useUser'

const INITIAL_PASSWORD_MD5 = 'e10adc3949ba59abbe56e057f20f883e'

interface UserFormDialogProps {
  user?: Api.User.UserInfo
}

export default function UserFormDialog({ user }: UserFormDialogProps) {
  const { t } = useTranslation()
  const isEditing = Boolean(user)
  const [open, setOpen] = useState(false)
  const roleOptions = useRoleOptions()
  const addUser = useAddtUser()
  const editUser = useEditUser()
  const isPending = addUser.isPending || editUser.isPending
  const schema = useMemo(() => z.object({
    username: z.string().trim().min(1, t('userManagement.usernameRequired')).max(50, t('userManagement.usernameMax')),
    gender: z.enum(['', '1', '2']),
    phone: z.string().trim().refine(value => !value || /^1[3-9]\d{9}$/.test(value), t('userManagement.phoneInvalid')),
    email: z.string().trim().refine(value => !value || z.email().safeParse(value).success, t('userManagement.emailInvalid')),
    status: z.enum(['0', '1']),
    roleId: z.string().min(1, t('userManagement.roleRequired')),
  }), [t])
  type FormValues = z.infer<typeof schema>
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.username ?? '',
      gender: user?.gender === 1 ? '1' : user?.gender === 2 ? '2' : '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
      status: user?.status === 0 ? '0' : '1',
      roleId: user?.roleId ?? '',
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    const onSuccess = () => {
      toast.success(t(isEditing ? 'userManagement.editSuccess' : 'userManagement.createSuccess'))
      setOpen(false)
    }
    const onError = () => toast.error(t('userManagement.saveFailed'))
    const details = {
      username: values.username,
      ...(values.gender && { gender: Number(values.gender) as 1 | 2 }),
      ...(values.phone && { phone: values.phone }),
      ...(values.email && { email: values.email }),
      status: Number(values.status) as 0 | 1,
      roleId: values.roleId,
    }

    if (user) {
      editUser.mutate({ id: user.id, ...details } as Api.User.EditParams, { onSuccess, onError })
      return
    }

    addUser.mutate({ ...details, password: INITIAL_PASSWORD_MD5 } as Api.User.AddParams, { onSuccess, onError })
  })

  const assignedRoleName = user?.roleName
    ?? (typeof user?.role === 'string' ? user.role : user?.role?.name)
  const roleMissingFromOptions = Boolean(user?.roleId && !roleOptions.data?.data?.some(role => role.id === user.roleId))

  return (
    <Can permission={isEditing ? 'user:edit' : 'user:create'}>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value)
            form.reset()
        }}
      >
        <DialogTrigger asChild>
          <Button size="sm" variant={isEditing ? 'outline' : 'default'}>
            {t(isEditing ? 'userManagement.edit' : 'userManagement.create')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(isEditing ? 'userManagement.edit' : 'userManagement.create')}</DialogTitle>
            <DialogDescription>{t('userManagement.formDescription')}</DialogDescription>
          </DialogHeader>
          <form id="user-account-form" onSubmit={onSubmit}>
            <FieldGroup>
              <Controller
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-username">{t('userManagement.username')}</FieldLabel>
                    <Input id="user-username" autoComplete="username" aria-invalid={fieldState.invalid} {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="gender"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t('userManagement.gender')}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}><SelectValue placeholder={t('userManagement.genderOptional')} /></SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="1">{t('male')}</SelectItem>
                          <SelectItem value="2">{t('female')}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-phone">{t('userManagement.phone')}</FieldLabel>
                    <Input id="user-phone" type="tel" aria-invalid={fieldState.invalid} {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-email">{t('userManagement.email')}</FieldLabel>
                    <Input id="user-email" type="email" aria-invalid={fieldState.invalid} {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="status"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t('userManagement.status')}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="1">{t('enabled')}</SelectItem>
                          <SelectItem value="0">{t('disabled')}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="roleId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t('userManagement.role')}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}><SelectValue placeholder={t('userManagement.selectRole')} /></SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roleMissingFromOptions && user?.roleId && (
                            <SelectItem value={user.roleId} disabled>
                              {assignedRoleName || user.roleId}
                              {' '}
                              (
                              {t('userManagement.roleUnavailable')}
                              )
                            </SelectItem>
                          )}
                          {(roleOptions.data?.data ?? []).map(role => (
                            <SelectItem key={role.id} value={role.id}>{role.roleName}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" form="user-account-form" disabled={isPending || roleOptions.isLoading}>
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Can>
  )
}
