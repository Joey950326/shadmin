import type { ReactNode } from 'react'
import type { Api } from '@/services/api/types/api'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ViewActionCellPros {
  userInfo: Api.User.UserInfo | null
  children?: ReactNode
  className?: string
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}

function ViewActionCell({ userInfo, children, className, visible, onVisibleChange }: ViewActionCellPros) {
  const { t } = useTranslation()
  return (
    <Dialog open={visible} onOpenChange={onVisibleChange}>
      {children && (
        <DialogTrigger asChild>
          {children }
        </DialogTrigger>
      )}
      {userInfo
        && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('table.viewUser')}</DialogTitle>
              <DialogDescription>{t('table.userViewDescription')}</DialogDescription>
            </DialogHeader>
            <FieldGroup className={cn(
              'gap-4',
              className,
            )}
            >

              <Field className="w-20">
                <FieldLabel htmlFor="avatar">
                  {t('table.userAvatar')}
                </FieldLabel>
                <Avatar className="h-20 p-2 flex justify-center">
                  <AvatarImage className="w-full" src={userInfo.avatar} loading="lazy" />
                  <AvatarFallback>{t('table.avatar')}</AvatarFallback>
                </Avatar>
              </Field>
              <Field>
                <FieldLabel htmlFor="username">
                  {t('table.userName')}
                </FieldLabel>
                <Input id="username" disabled value={userInfo.username}>
                </Input>
              </Field>
              <Field>
                <FieldLabel htmlFor="gender">
                  {t('table.gender')}
                </FieldLabel>
                <Input id="gender" disabled value={userInfo.gender}>
                </Input>
              </Field>
              <Field>
                <FieldLabel htmlFor="idCard">
                  {t('table.idCard')}
                </FieldLabel>
                <Input id="idCard" disabled value={userInfo.idCard}>
                </Input>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">
                  {t('table.email')}
                </FieldLabel>
                <Input id="email" disabled value={userInfo.email}>
                </Input>
              </Field>
              <Field>
                <FieldLabel htmlFor="address">
                  {t('table.address')}
                </FieldLabel>
                <Input id="address" disabled value={userInfo.address}>
                </Input>
              </Field>
            </FieldGroup>
          </DialogContent>
        )}
    </Dialog>
  )
}

export default memo(ViewActionCell)
