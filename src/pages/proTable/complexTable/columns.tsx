import type { ColumnDef } from '@tanstack/react-table'
import type { Api } from '@/services/api/types/api'
import { Button } from '@/components/ui/button'
import DeleteActionCell from './components/DeleteActionCell'
import EditActionCell from './components/EditActionCell'
import ViewActionCell from './components/ViewActionCell'

export const columns: ColumnDef<Api.User.UserInfo>[] = [
  // {
  //   accessorKey: 'id',
  //   header: 'ID',
  // },
  {
    accessorKey: 'username',
    header: '用户名',
  },
  {
    accessorKey: 'gender',
    header: '性别',
  },
  {
    // accessorKey: 'age',
    accessorFn: row => row.user.detail.age,
    header: '年龄',
  },
  {
    accessorKey: 'idCard',
    header: '身份证号',
  },
  {
    accessorKey: 'email',
    header: '邮箱',
  },
  {
    accessorKey: 'address',
    header: '地址',
  },
  {
    accessorKey: 'status',
    header: '状态',
  },
  {
    accessorKey: 'createTime',
    header: '创建时间',
  },
  {
    id: 'actions',
    header: '操作',
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
              编辑
            </Button>
          </EditActionCell>
          <ViewActionCell userInfo={row.original}>
            <Button
              variant="outline"
              size="sm"
            >
              查看
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
