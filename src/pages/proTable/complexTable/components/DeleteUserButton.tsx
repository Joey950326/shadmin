import type { ReactNode } from 'react'
import { memo } from 'react'
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
  confirmText = '确定',
  alertText = '确定删除选中用户?',
  cancelText = '取消',
  onConfirm,
}: DeleteUserButtonProps) {
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
          <AlertDialogTitle>温馨提示</AlertDialogTitle>
          <AlertDialogDescription>
            {alertText}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => onConfirm?.()}>{confirmText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default memo(DeleteUserButton)
