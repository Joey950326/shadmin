import type { ReactNode } from 'react'
import type { avatarRefDef } from './AvatarUpload'
import type { Api } from '@/services/api/types/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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

const formSchema = z.object({
  avatar: z.url('头像必须为有效网址'),
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

function EditActionCell({ userInfo, children, visible, onVisibleChange, onEdit, onAvatarUpload }: EditActionCellPros) {
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
                <DialogTitle>编辑用户</DialogTitle>
                <DialogDescription>编辑用户性别，地址，年龄，等相关信息</DialogDescription>
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
                        用户头像
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
                          用户名
                        </FieldLabel>
                        <Input
                          id="username"
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="请输入用户名"
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
                          性别
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value.toString()}
                          onValueChange={val => field.onChange(Number(val))}
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
                  <Button type="button" variant="outline">取消</Button>
                </DialogClose>
                <Button type="submit" form="edit-user-form" disabled={avatarRef?.current?.isUploading || !isFormChange}>确定</Button>
              </DialogFooter>
            </DialogContent>
          )
        : (
            <div className="size-full flex items-center justify-center">暂无用户信息</div>
          )}
    </Dialog>
  )
}

export default memo(EditActionCell)
