import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import * as z from 'zod'
import registerSvg from '@/assets/local-svg/register.svg'
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

const registerFormSchema = z
  .object({
    username: z.string().min(1, '用户名不能为空'),
    password: z.string().min(6, '密码长度不能少于6个字符').max(20, '密码长度不能超过20个字符'),
    passwordConfirm: z.string().min(6, '确认密码长度不能少于6个字符').max(20, '确认密码长度不能超过20个字符'),
  })
  .refine(data => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'], // 将错误关联到 passwordConfirm 字段
    message: '两次输入的密码不一致',
  })

type RegisterFormValues = z.infer<typeof registerFormSchema>

function RegisterPage() {
  const navigate = useNavigate()
  // 路由跳转到登录页面
  const handleLoginClick = () => {
    navigate('/auth/login')
  }

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      password: '',
      passwordConfirm: '',
    },
    mode: 'onChange',
  })

  const handleRegisterClick = async (data: RegisterFormValues) => {
    console.warn('注册表单数据：', data)
  }

  return (
    <div className="flex justify-center items-center gap-2 size-full">
      <section className="flex-1 sm:flex-1/2">
        <Card className="w-full max-w-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle>账户注册</CardTitle>
            <CardDescription>
              输入用户名或密码进行注册
            </CardDescription>
            <CardAction>
              <Button variant="link" onClick={handleLoginClick}>
                登录
                <ArrowRightIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form id="register-form" onSubmit={form.handleSubmit(handleRegisterClick)}>
              <FieldGroup>
                <Controller
                  name="username"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="grid gap-2" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="register-form-username">用户名</FieldLabel>
                      <Input
                        {...field}
                        id="register-form-username"
                        type="text"
                        placeholder="请输入用户名"
                      />
                      {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="grid gap-2" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="register-form-password">密码</FieldLabel>
                      <Input
                        {...field}
                        id="register-form-password"
                        type="password"
                        placeholder="请输入密码"
                      />
                      {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                    </Field>
                  )}
                />

                <Controller
                  name="passwordConfirm"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="grid gap-2" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="register-form-passwordConfirm">确认密码</FieldLabel>
                      <Input
                        {...field}
                        id="register-form-passwordConfirm"
                        type="password"
                        placeholder="请确认密码"
                      />
                      {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                    </Field>
                  )}
                />

              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" form="register-form" disabled={!form.formState.isValid}>
              确定
            </Button>
            {/* <Button type="submit" className="w-full" onClick={handleLoginClick}>
              返回
            </Button> */}
          </CardFooter>
        </Card>
      </section>
      <section className="hidden sm:block sm:flex-1/2 ">
        {/* <img className="size-full" src={loginSvg} alt="login svg" /> */}
        <object className="size-full" data={registerSvg} type="image/svg+xml" aria-label="Register Illustration">
        </object>
      </section>
    </div>
  )
}
export default RegisterPage
