import type { ReactNode } from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface DeleteUserButtonProps {
  children: ReactNode
  className?: string
  alertText?: string
  cancelText?: string
  confirmText?: string
  onConfirm?: () => void
}

function DeleteUserButton({
  children,
  className,
  confirmText,
  alertText,
  cancelText,
  onConfirm,
}: DeleteUserButtonProps) {
  const { t } = useTranslation()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className={cn(
        className,
      )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{t('table.friendlyReminder')}</AlertDialogTitle>
          <AlertDialogDescription>
            {alertText ?? t('table.confirmDeleteSelectedUsers')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText ?? t('cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => onConfirm?.()}>{confirmText ?? t('confirm')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default memo(DeleteUserButton)
