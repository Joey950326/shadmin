import type { UserInfoFormRef } from './UsefInfoForm'
import type { Api } from '@/services/api/types/api'
import { BadgePlusIcon } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAddtUser } from '@/services/api/hooks/useUser'
import UserInfoForm from './UsefInfoForm'

interface AddUserButtonProps {
  onSuccessCb?: () => void
}

export default function AddUserButton({ onSuccessCb }: AddUserButtonProps) {
  const { t } = useTranslation()
  const [userInfo] = useState<Api.User.UserInfo | null>(null)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const ref = useRef<UserInfoFormRef>(null)

  const [formCanCofirm, setFormCanCofirm] = useState<boolean>(false)

  const { mutate, isPending } = useAddtUser()

  const buttonDisabled = useMemo(() => {
    return isPending || !formCanCofirm
  }, [formCanCofirm, isPending])

  const handleConfirm = useCallback(async () => {
    if (ref.current) {
      const isValid = await ref.current.trigger()
      if (isValid) {
        const value = ref.current.getValues()
        // 提交网络
        mutate(value, {
          onSuccess() {
            toast.success(t('table.addSuccess'), {
              position: 'top-right',
            })
            onSuccessCb?.()
          },
          onError() {
            toast.error(t('table.addFailed'), {
              position: 'top-right',
            })
          },
          onSettled() {
            setDialogOpen(false)
          },
        })
      }
    }
  }, [mutate, onSuccessCb, t])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {t('table.addUser')}
          <BadgePlusIcon className="hidden lg:block" />
        </Button>
      </DialogTrigger>

      <DialogContent className="px-4">
        <ScrollArea className="max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t('table.addUser')}</DialogTitle>
            <DialogDescription>{t('table.userInfoDescription')}</DialogDescription>
          </DialogHeader>
          <UserInfoForm value={userInfo} ref={ref} onComfirmStatusChange={setFormCanCofirm} className="p-2" />
          <DialogFooter className="p-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">{t('cancel')}</Button>
            </DialogClose>
            <Button disabled={buttonDisabled} onClick={handleConfirm}>{t('confirm')}</Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
