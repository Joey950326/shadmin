import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Can from '@/components/Can'
import FullScreenLoader from '@/components/LoadingScreen'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useLogin } from '@/services/api/hooks/auth'
import { QUERY_KEYS } from '@/services/api/keys'
import { getMenuTreeApi, getUserMenusApi } from '@/services/api/modules/menu'
import { getCurrentUserPermissionsApi } from '@/services/api/modules/permission'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectToken, selectUserInfo, setCredentials, setManualLogin } from '@/store/modules/user'
import { hashPassword } from '@/utils'

export default function PermissionSwitchPage() {
  const { t } = useTranslation('common')
  const dispatch = useAppDispatch()
  const login = useLogin()
  const queryCache = useQueryClient()
  const token = useAppSelector(selectToken)
  const userInfo = useAppSelector(selectUserInfo)
  const [switching, setSwitching] = useState(false)
  const switchAvailable = import.meta.env.DEV

  const switchAccount = async (account: 'user' | 'admin') => {
    if (!switchAvailable || switching)
      return

    const previous = { token, userInfo }
    setSwitching(true)
    try {
      const { DEMO_ACCOUNTS } = await import('./demoAccounts')
      const credentials = DEMO_ACCOUNTS[account]
      const response = await login.mutateAsync({
        username: credentials.username,
        password: hashPassword(credentials.password),
      })
      const result = response.data
      if (!result?.access_token) {
        throw new Error('Login response did not include an access token')
      }

      dispatch(setCredentials({
        token: result.access_token,
        userInfo: result.userInfo || { username: credentials.username },
      }))
      dispatch(setManualLogin(true))

      const username = (result.userInfo || { username: credentials.username }).username
      const menuKey = QUERY_KEYS.MENU.AUTHORIZED_NAVIGATION(username)
      const permissionKey = QUERY_KEYS.PERMISSION.CURRENT_USER(username)
      await Promise.all([
        queryCache.invalidateQueries({ queryKey: menuKey, exact: true }),
        queryCache.invalidateQueries({ queryKey: permissionKey, exact: true }),
      ])
      await Promise.all([
        queryCache.fetchQuery({
          queryKey: menuKey,
          queryFn: async () => {
            const [treeResponse, menusResponse] = await Promise.all([getMenuTreeApi(), getUserMenusApi()])
            return { tree: treeResponse.data ?? [], menuIds: menusResponse.data?.menuIds ?? [] }
          },
          staleTime: 0,
        }),
        queryCache.fetchQuery({
          queryKey: permissionKey,
          queryFn: async () => {
            const response = await getCurrentUserPermissionsApi()
            return response.data?.permissionCodes ?? []
          },
          staleTime: 0,
        }),
      ])
    }
    catch {
      dispatch(setCredentials(previous))
      toast.error(t('permissionDemo.switchFailed'), { position: 'top-center' })
    }
    finally {
      setSwitching(false)
    }
  }

  return (
    <>
      <FullScreenLoader open={switching} text={t('permissionDemo.switching')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('permissionDemo.title')}</CardTitle>
          <CardDescription>{t('permissionDemo.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <section
            aria-labelledby="permission-demo-instructions"
            className="flex flex-col gap-2"
          >
            <h2
              id="permission-demo-instructions"
              className="text-sm font-medium"
            >
              {t('permissionDemo.instructionsTitle')}
            </h2>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
              {switchAvailable && (
                <li>{t('permissionDemo.instructionSwitchAccount')}</li>
              )}
              <li>{t('permissionDemo.instructionPermissionCodes')}</li>
              <li>{t('permissionDemo.instructionNoRealAction')}</li>
              <li>{t('permissionDemo.instructionMenuAndOperation')}</li>
            </ol>
          </section>
          <section
            aria-labelledby="permission-demo-examples"
            className="flex flex-col gap-2"
          >
            <h2 id="permission-demo-examples" className="text-sm font-medium">
              {t('permissionDemo.examplesTitle')}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Can permission="demo:view">
                <Button>{t('permissionDemo.view')}</Button>
              </Can>
              <Can permission="demo:edit">
                <Button variant="outline">{t('permissionDemo.edit')}</Button>
              </Can>
              <Can permission="demo:delete">
                <Button variant="destructive">
                  {t('permissionDemo.delete')}
                </Button>
              </Can>
            </div>
          </section>
          {switchAvailable && (
            <section
              aria-labelledby="permission-demo-account-switch"
              className="flex flex-col gap-2"
            >
              <h2
                id="permission-demo-account-switch"
                className="text-sm font-medium"
              >
                {t('permissionDemo.switchAccountTitle')}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={switching || userInfo?.username === 'user'}
                  onClick={() => void switchAccount('user')}
                >
                  {t('permissionDemo.switchUser')}
                </Button>
                <Button
                  disabled={switching || userInfo?.username === 'admin'}
                  variant="outline"
                  onClick={() => void switchAccount('admin')}
                >
                  {t('permissionDemo.switchAdmin')}
                </Button>
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </>
  )
}
