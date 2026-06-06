import type { Api } from '@/services/api/types/api'
import { CircleAlertIcon } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface DeleteActionCellPros {
  rowData: Api.User.UserInfo
  onConfirm: (id: string) => void
  isLoading?: boolean
}

export default function DeleteActionCell({ rowData, onConfirm, isLoading }: DeleteActionCellPros) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
        >
          删除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>温馨提示</AlertDialogTitle>
          <AlertDialogDescription className="flex items-center gap-2">
            <CircleAlertIcon />
            <span>
              确定删除
              <span className="font-bold">
                {rowData.username}
                ?
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(rowData.id)} disabled={isLoading}>
            {isLoading
              ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="size-4" />
                    <span>删除中</span>
                  </div>
                )
              : '确定'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
