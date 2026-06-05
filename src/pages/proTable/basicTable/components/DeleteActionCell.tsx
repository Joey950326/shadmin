import type { Api } from '@/services/api/types/api'
import { CircleAlertIcon } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface DeleteActionCellPros {
  rowData: Api.User.UserInfo
  onConfirm: (id: string) => void
}

export default function DeleteActionCell({ rowData, onConfirm }: DeleteActionCellPros) {
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
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(rowData.id)}>确定</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
