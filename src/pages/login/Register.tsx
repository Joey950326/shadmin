import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
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

interface RegisterFormValues {
  username: string
  password: string
  passwordConfirm: string
}

function RegisterPage() {
  const { t } = useTranslation()
  const registerFormSchema = z.object({
    username: z.string().min(1, t('auth:common.usernameNotEmpty')),
    password: z.string().min(6, t('auth:common.passwordMinLength', { count: 6 })).max(20, t('auth:common.passwordMaxLength', { count: 20 })),
    passwordConfirm: z.string().min(6, t('auth:common.passwordMinLength', { count: 6 })).max(20, t('auth:common.passwordMaxLength', { count: 20 })),
  }).refine(data => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: t('auth:register.passwordMismatch'),
  })
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
            <CardTitle>{t('auth:register.accountRegister')}</CardTitle>
            <CardDescription>
              {t('auth:register.description')}
            </CardDescription>
            <CardAction>
              <NavLink to="/auth/login" className="flex flex-row items-center gap-2">
                <ArrowRightIcon size={16} />
                <span>{t('auth:common.login')}</span>
              </NavLink>
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
                      <FieldLabel htmlFor="register-form-username">{t('auth:common.username')}</FieldLabel>
                      <Input
                        {...field}
                        id="register-form-username"
                        type="text"
                        placeholder={t('auth:common.inputUsername')}
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
                      <FieldLabel htmlFor="register-form-password">{t('auth:common.password')}</FieldLabel>
                      <Input
                        {...field}
                        id="register-form-password"
                        type="password"
                        placeholder={t('auth:common.inputPassword')}
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
                      <FieldLabel htmlFor="register-form-passwordConfirm">{t('auth:register.confirmPassword')}</FieldLabel>
                      <Input
                        {...field}
                        id="register-form-passwordConfirm"
                        type="password"
                        placeholder={t('auth:register.inputConfirmPassword')}
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
              {t('confirm')}
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
