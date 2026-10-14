import type { Api } from '@/services/api/types/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRoleOptions } from '@/services/api/hooks/useRole'
import { useAddtUser, useEditUser } from '@/services/api/hooks/useUser'
import { hashPassword } from '@/utils'

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
    username: z.string().trim().min(2, t('userManagement.usernameMin')).max(20, t('userManagement.usernameMax')),
    password: isEditing
      ? z.string().optional()
      : z.string().min(1, t('userManagement.passwordRequired')),
    roleId: z.string().min(1, t('userManagement.roleRequired')),
  }), [isEditing, t])
  type FormValues = z.infer<typeof schema>
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.username ?? '',
      password: '',
      roleId: user?.roleId ?? '',
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    const onSuccess = () => {
      toast.success(t(isEditing ? 'userManagement.editSuccess' : 'userManagement.createSuccess'))
      setOpen(false)
    }
    const onError = () => toast.error(t('userManagement.saveFailed'))
    const password = values.password ? hashPassword(values.password) : undefined

    if (user) {
      editUser.mutate({
        ...user,
        username: values.username,
        roleId: values.roleId,
        ...(password && { password }),
      }, { onSuccess, onError })
      return
    }

    if (!password)
      return
    addUser.mutate({ username: values.username, password, roleId: values.roleId }, { onSuccess, onError })
  })

  return (
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
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="user-password">{t('userManagement.password')}</FieldLabel>
                  <Input
                    id="user-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder={isEditing ? t('userManagement.passwordUnchanged') : undefined}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
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
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder={t('userManagement.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
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
  )
}
