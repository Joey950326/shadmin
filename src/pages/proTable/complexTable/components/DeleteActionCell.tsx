import type { Api } from '@/services/api/types/api'
import { CircleAlertIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface DeleteActionCellPros {
  rowData: Api.User.UserInfo
  onConfirm: (id: string) => void
  isLoading?: boolean
}

export default function DeleteActionCell({ rowData, onConfirm, isLoading }: DeleteActionCellPros) {
  const { t } = useTranslation()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
        >
          {t('delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('table.friendlyReminder')}</AlertDialogTitle>
          <AlertDialogDescription className="flex items-center gap-2">
            <CircleAlertIcon />
            <span>
              {t('table.confirmDeleteUser')}
              <span className="font-bold">
                {rowData.username}
                ?
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(rowData.id)} disabled={isLoading}>
            {isLoading
              ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="size-4" />
                    <span>{t('table.deleting')}</span>
                  </div>
                )
              : t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
