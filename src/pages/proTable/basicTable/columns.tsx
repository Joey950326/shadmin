import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { Api } from '@/services/api/types/api'
import { Button } from '@/components/ui/button'
import DeleteActionCell from './components/DeleteActionCell'
import EditActionCell from './components/EditActionCell'
import ViewActionCell from './components/ViewActionCell'

export function createColumns(t: TFunction): ColumnDef<Api.User.UserInfo>[] {
  return [
  // {
  //   accessorKey: 'id',
  //   header: 'ID',
  //   enableHiding: true,
  // },
    {
      id: 'username',
      accessorKey: 'username',
      header: t('table.username'),
    },
    {
      id: 'gender',
      accessorKey: 'gender',
      header: t('table.gender'),
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            {
              row.getValue('gender') === 1 ? t('male') : t('female')
            }
          </div>
        )
      },
    },
    {
      id: 'age',
      // accessorKey: 'age',
      accessorFn: row => row.user.detail.age,
      header: t('table.age'),
    },
    {
      id: 'idCard',
      accessorKey: 'idCard',
      header: t('table.idCard'),
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: t('table.email'),
    },
    {
      id: 'address',
      accessorKey: 'address',
      header: t('table.address'),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            {
              row.getValue('status') === 1 ? t('enabled') : t('disabled')
            }
          </div>
        )
      },

    },
    {
      id: 'createTime',
      accessorKey: 'createTime',
      header: t('table.createdAt'),
    },
    {
      id: 'actions',
      header: t('table.actions'),
      cell: ({ row, table }) => {
      // 删除用户
        const handleDeleteConfirm = (rowId: string) => {
          const onRowDelete = table.options.meta?.onRowDelete
          onRowDelete?.(rowId)
        }
        const isDeleting = Boolean(table.options.meta?.deleteLoading)

        // 修改用户
        // const handleEdit = (data: Api.User.UserInfo) => {
        //   const onRowEdit = table.options.meta?.onRowEdit
        //   onRowEdit?.(data)
        // }

        const handleEdit = table.options.meta?.onRowEdit

        const handleAvatarUpload = table.options.meta?.onAvatarUpload

        return (
          <div className="flex items-center justify-end gap-2">
            <EditActionCell userInfo={row.original} onEdit={handleEdit} onAvatarUpload={handleAvatarUpload}>
              <Button
                variant="outline"
                size="sm"
              >
                {t('edit')}
              </Button>
            </EditActionCell>
            <ViewActionCell userInfo={row.original}>
              <Button
                variant="outline"
                size="sm"
              >
                {t('view')}
              </Button>
            </ViewActionCell>
            <DeleteActionCell
              rowData={row.original}
              onConfirm={handleDeleteConfirm}
              isLoading={isDeleting}
            />
          </div>

        )
      },
    },
  ]
}
