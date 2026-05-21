import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router'
import { toast } from 'sonner'
import * as z from 'zod'

import welcomeSvg from '@/assets/local-svg/welcome.svg'

import { Button } from '@/components/ui/button'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { useLogin } from '@/services/api/hooks/auth'

import { useAppDispatch } from '@/store/hooks'
import { setToken } from '@/store/modules/user'
import { hashPassword } from '@/utils'

/** 定义表单类型 */
interface LoginFormValues {
  username: string
  password: string
}

function LoginPage() {
  const { i18n, t } = useTranslation()
  const dispatch = useAppDispatch()
  const loginMutaition = useLogin()
  const loginFormSchema = useMemo(() => z.object({
    username: z.string().min(1, t('auth:common.usernameNotEmpty', { count: 1 })),
    password: z.string()
      .min(6, t('auth:common.passwordMinLength', { count: 6 }))
      .max(20, t('auth:common.passwordMaxLength', { count: 20 })),
  }), [t])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { // 默认值
      username: '',
      password: '',
    },
    mode: 'onChange', // 表单验证模式，实时验证
  }) // 依赖语言变化重新创建表单验证模式

  // 解决语言切换后zod表单错误提示不更新的问题
  useEffect(() => {
    if (form.formState.isDirty) {
      void form.trigger() // 语言变化时触发表单验证，更新错误提示
    }
  }, [i18n.language, form]) // 监听语言变化和表单实例变化

  const navigate = useNavigate()
  /** 路由跳转到注册页面 */
  const handleRegisterClick = () => {
    navigate('/auth/register')
  }

  const handleLoginClick = async (data: LoginFormValues) => {
    const postData = {
      username: data.username,
      password: hashPassword(data.password), // 对密码进行哈希处理
    }

    // await delay(3000) // 模拟登录请求
    loginMutaition.mutate(postData, {
      onSuccess: (res) => {
        toast.success(t('auth:login.loginSuccess'), {
          position: 'top-center',
        })
        dispatch(setToken(res.data.access_token)) // 模拟设置token
      },
      onError: (error: unknown) => {
        console.error('登录失败:', error)
        toast.error(t('auth:login.loginFailedMessage'), {
          position: 'top-center',
        })
      },
    })
  }

  return (
    <div className="flex justify-center items-center gap-2 size-full">
      <section className="hidden sm:block sm:flex-1/2 ">
        {/* <img className="size-full" src={loginSvg} alt="login svg" /> */}
        <object className="size-full" data={welcomeSvg} type="image/svg+xml" aria-label="Login Illustration">
        </object>
      </section>
      <section className="flex-1 sm:flex-1/2">
        <Card className="w-full max-w-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle>{t('auth:login.loginWithUsernameAndPassword')}</CardTitle>
            <CardDescription>
              {t('auth:login.loginWithUsernameDescription')}
            </CardDescription>
            <CardAction>
              <Button variant="link" onClick={handleRegisterClick}>
                <ArrowLeftIcon />
                {t('auth:common.register')}
              </Button>

            </CardAction>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={form.handleSubmit(handleLoginClick)}>
              <FieldGroup>
                <Controller
                  name="username"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-6">
                      <Field data-invalid={fieldState.invalid} className="grid gap-2">
                        <FieldLabel htmlFor="login-form-username">{t('auth:common.username')}</FieldLabel>
                        <Input
                          {...field}
                          id="login-form-username"
                          type="text"
                          placeholder={t('auth:common.inputUsername')}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                      </Field>
                    </div>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="grid gap-2" data-invalid={fieldState.invalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="login-form-password">{t('auth:common.password')}</FieldLabel>
                        <a
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          {t('auth:login.forgotPassword')}
                        </a>
                      </div>
                      <Input id="login-form-password" {...field} type="password" placeholder={t('auth:common.inputPassword')} aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Field>
              <Button type="submit" form="login-form" className="w-full" disabled={!form.formState.isValid || loginMutaition.isPending}>
                {(loginMutaition.isPending) ? t('auth:login.logining') : t('auth:common.login')}
              </Button>
              <NavLink to="/auth/code-login" end>
                <Button variant="outline" className="w-full">
                  {t('auth:login.loginWithCode')}
                </Button>
              </NavLink>
            </Field>
          </CardFooter>
        </Card>
      </section>
    </div>
  )
}
export default LoginPage
