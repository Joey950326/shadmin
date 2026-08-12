import type { ReactNode } from 'react'
import type { UserInfoFormRef } from './UsefInfoForm'
import type { Api } from '@/services/api/types/api'
import { memo, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import UserInfoForm from './UsefInfoForm'

interface EditActionCellPros {
  userInfo: Api.User.UserInfo | null
  onEdit?: (data: Api.User.UserInfo, cb?: () => void) => void
  children?: ReactNode
  className?: string
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  onAvatarUpload?: (data: Api.User.AvatarUploadParams, successCb?: (data: Api.User.AvatarUploadResponse) => void, failCb?: (error: Error) => void) => void
}

function EditActionCell({ userInfo, children, visible, onVisibleChange, onEdit }: EditActionCellPros) {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState<boolean>(visible ?? false)
  const [confirmDisable, setConfirmDisable] = useState<boolean>(true)

  const ref = useRef<UserInfoFormRef>(null)

  const handleConfirm = async () => {
    if (ref.current) {
      const isValid = await ref.current.trigger()
      if (isValid) {
        const value = ref.current.getValues()
        const submitData = Object.assign({}, userInfo, value)
        onEdit?.(submitData, () => setDialogOpen(false))
      }
    }
  }

  const handleDialogChange = useCallback((visible: boolean) => {
    if (!visible) {
      ref.current?.reset()
    }
    setDialogOpen(visible)
    onVisibleChange?.(visible)
  }, [onVisibleChange])

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
                <DialogTitle>{t('table.editUser')}</DialogTitle>
                <DialogDescription>{t('table.userInfoDescription')}</DialogDescription>
              </DialogHeader>

              <UserInfoForm value={userInfo} ref={ref} onComfirmStatusChange={val => setConfirmDisable(!val)} />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {t('cancel')}
                  </Button>
                </DialogClose>

                <Button disabled={confirmDisable} onClick={handleConfirm}>{t('confirm')}</Button>
              </DialogFooter>
            </DialogContent>
          )
        : (
            <div className="size-full flex items-center justify-center">{t('table.noUserInfo')}</div>
          )}
    </Dialog>
  )
}

export default memo(EditActionCell)
