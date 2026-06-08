import type { ReactNode } from 'react'
import type { Api } from '@/services/api/types/api'
import { memo } from 'react'
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
              <DialogTitle>查看用户</DialogTitle>
              <DialogDescription>展示用户性别，地址，年龄，等相关信息</DialogDescription>
            </DialogHeader>
            <FieldGroup className={cn(
              'gap-4',
              className,
            )}
            >

              <Field className="w-20">
                <FieldLabel htmlFor="avatar">
                  用户头像
                </FieldLabel>
                <Avatar className="h-20 p-2 flex justify-center">
                  <AvatarImage className="w-full" src={userInfo.avatar} loading="lazy" />
                  <AvatarFallback>头像</AvatarFallback>
                </Avatar>
              </Field>
              <Field>
                <FieldLabel htmlFor="username">
                  用户姓名
                </FieldLabel>
                <Input id="username" disabled value={userInfo.username}>
                </Input>
              </Field>
              <Field>
                <FieldLabel htmlFor="gender">
                  性别
                </FieldLabel>
                <Input id="gender" disabled value={userInfo.gender}>
                </Input>
              </Field>
              <Field>
                <FieldLabel htmlFor="idCard">
                  身份证
                </FieldLabel>
                <Input id="idCard" disabled value={userInfo.idCard}>
                </Input>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">
                  邮箱
                </FieldLabel>
                <Input id="email" disabled value={userInfo.email}>
                </Input>
              </Field>
              <Field>
                <FieldLabel htmlFor="address">
                  地址
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
