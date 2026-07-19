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
  //   enableHiding: true,
  // },
  {
    id: 'username',
    accessorKey: 'username',
    header: '用户名',
  },
  {
    id: 'gender',
    accessorKey: 'gender',
    header: '性别',
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {
            row.getValue('gender') === 1 ? '男' : '女'
          }
        </div>
      )
    },
  },
  {
    id: 'age',
    // accessorKey: 'age',
    accessorFn: row => row.user.detail.age,
    header: '年龄',
  },
  {
    id: 'idCard',
    accessorKey: 'idCard',
    header: '身份证号',
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: '邮箱',
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: '地址',
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {
            row.getValue('status') === 1 ? '启用' : '禁用'
          }
        </div>
      )
    },

  },
  {
    id: 'createTime',
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
