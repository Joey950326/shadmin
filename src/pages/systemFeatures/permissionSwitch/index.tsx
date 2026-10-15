import { useTranslation } from 'react-i18next'
import Can from '@/components/Can'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PermissionSwitchPage() {
  const { t } = useTranslation('common')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('permissionDemo.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Can permission="demo:view">
          <Button>{t('permissionDemo.view')}</Button>
        </Can>
      </CardContent>
    </Card>
  )
}
