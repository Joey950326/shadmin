import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
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
const loginFormSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码长度不能少于6个字符').max(20, '密码长度不能超过20个字符'),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

function LoginPage() {
  const dispatch = useAppDispatch()
  const loginMutaition = useLogin()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { // 默认值
      username: '',
      password: '',
    },
    mode: 'onChange', // 表单验证模式，实时验证
  })

  const navigate = useNavigate()
  /** 路由跳转到注册页面 */
  const handleRegisterClick = () => {
    navigate('/auth/register')
  }
  /**
   * 路由跳转到验证码登录页面
   */
  //   const handleCodeLoginClick = () => {
  //     navigate('/auth/code-login')
  //   }

  const handleLoginClick = async (data: LoginFormValues) => {
    const postData = {
      username: data.username,
      password: hashPassword(data.password), // 对密码进行哈希处理
    }

    // await delay(3000) // 模拟登录请求
    loginMutaition.mutate(postData, {
      onSuccess: (res) => {
        toast.success('登录成功！', {
          position: 'top-center',
        })
        dispatch(setToken(res.data.access_token)) // 模拟设置token
      },
      onError: (error: unknown) => {
        console.error('登录失败:', error)
        toast.error('登录失败，请检查用户名和密码！', {
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
            <CardTitle>账户密码登录</CardTitle>
            <CardDescription>
              输入用户名或邮箱进行登录
            </CardDescription>
            <CardAction>
              <Button variant="link" onClick={handleRegisterClick}>
                <ArrowLeftIcon />
                注册
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
                        <FieldLabel htmlFor="login-form-username">用户名</FieldLabel>
                        <Input
                          {...field}
                          id="login-form-username"
                          type="text"
                          placeholder="请输入用户名"
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
                        <FieldLabel htmlFor="login-form-password">密码</FieldLabel>
                        <a
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          忘记密码
                        </a>
                      </div>
                      <Input id="login-form-password" {...field} type="password" placeholder="请输入密码" aria-invalid={fieldState.invalid} />
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
                {(loginMutaition.isPending) ? '登录中...' : '登录'}
              </Button>
              <NavLink to="/auth/code-login" end>
                <Button variant="outline" className="w-full">
                  验证码登录
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
