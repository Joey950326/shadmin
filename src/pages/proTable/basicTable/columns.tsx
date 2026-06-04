import type { ColumnDef } from '@tanstack/react-table'
import type { Api } from '@/services/api/types/api'
import { Button } from '@/components/ui/button'

export const columns: ColumnDef<Api.User.UserInfo>[] = [
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
    cell: () => {
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
          >
            编辑
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
          >
            查看
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {}}
          >
            删除
          </Button>
        </div>
      )
    },
  },

]
