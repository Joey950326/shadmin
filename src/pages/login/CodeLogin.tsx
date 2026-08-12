import { ArrowLeftIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router'
import codeLoginSvg from '@/assets/local-svg/codeLogin.svg'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function CodeLoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  // 路由跳转到登录页面
  const handleLoginClick = () => {
    navigate('/auth/login')
  }
  return (
    <div className="flex justify-center items-center gap-2 size-full">
      <section className="hidden sm:block sm:flex-1/2 ">
        <object className="size-full" data={codeLoginSvg} type="image/svg+xml" aria-label={t('auth:login.loginWithCode')}>
        </object>
      </section>
      <section className="flex-1 sm:flex-1/2">
        <Card className="w-full max-w-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle>{t('auth:login.loginWithCode')}</CardTitle>
            <CardDescription>
              {t('auth:login.codeLoginDescription')}
            </CardDescription>
            <CardAction>
              <Button variant="link" onClick={handleLoginClick}>
                <ArrowLeftIcon />
                {t('auth:common.register')}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="phone">{t('auth:common.phone')}</Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder={t('auth:common.inputPhone')}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="code">{t('auth:common.verificationCode')}</Label>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Input className="grow" id="code" type="text" required placeholder={t('auth:common.inputVerificationCode')} />
                    <Button className="max-w-lg" variant="outline">{t('auth:common.getVerificationCode')}</Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              {t('confirm')}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleLoginClick}>
              <NavLink to="/auth/login" end />
              {t('back')}
            </Button>
          </CardFooter>
        </Card>
      </section>

    </div>
  )
}
export default CodeLoginPage
