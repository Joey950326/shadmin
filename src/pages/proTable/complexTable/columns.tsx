import type { ColumnDef, Row } from '@tanstack/react-table'
import type { SortType as SortValueType } from './components/SortFilterHeader'
import type { Api } from '@/services/api/types/api'
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import DeleteActionCell from './components/DeleteActionCell'
import EditActionCell from './components/EditActionCell'
import RadioHeader from './components/RadioHeader'
import SortFilterHeader from './components/SortFilterHeader'
import ViewActionCell from './components/ViewActionCell'

const sortMap = [false, 'desc', 'asc'] as const

type SortType = typeof sortMap[number]

function getNextSort(currentSort: SortType): SortType {
  const idx = sortMap.indexOf(currentSort)
  return sortMap[(idx + 1) % sortMap.length]
}

function zhTextSortFn<T>(rowA: Row<T>, rowB: Row<T>, columnId: string) {
  const nameA = rowA.getValue<string>(columnId) || ''
  const nameB = rowB.getValue<string>(columnId) || ''

  // 使用中文本地化排序（推荐）
  return nameA.localeCompare(nameB, 'zh-CN', {
    sensitivity: 'accent',
    numeric: true,
  })
}

const genderRadioMap = {
  1: '男',
  2: '女',
}

const statusRadioMap = {
  0: '禁用',
  1: '启用',
}

export const columns: ColumnDef<Api.User.UserInfo>[] = [
  // {
  //   accessorKey: 'id',
  //   header: 'ID',
  // },
  // 用户名
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      const canExpand = row.getCanExpand()
      return canExpand
        ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={row.getToggleExpandedHandler()}
              aria-label={row.getIsExpanded() ? '收起' : '展开'}
            >
              {row.getIsExpanded()
                ? (
                    <ChevronDownIcon className="h-4 w-4 transition-transform" />
                  )
                : (
                    <ChevronRightIcon className="h-4 w-4 transition-transform" />
                  )}
            </Button>
          )
        : null
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
          || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => {
      let filterValue = column.getFilterValue() as string ?? ''

      const currentSort = column.getIsSorted().toString() as SortValueType

      const handleSortValueChange = (val: 'desc' | 'asc' | 'false') => {
        if (val === 'false') {
          column.clearSorting()
        }
        else {
          column.toggleSorting(val === 'desc')
        }
      }
      const handleFilterValueChange = (val: string) => {
        if (!val) {
          column.setFilterValue('')
        }
        else {
          column.setFilterValue(val)
        }
        filterValue = val
      }

      return (
        <SortFilterHeader<string>
          id="username"
          filterValue={filterValue}
          onFilterChange={handleFilterValueChange}
          sortValue={currentSort}
          onSortChange={handleSortValueChange}
        >
          <span>用户名</span>
        </SortFilterHeader>

      )
    },
    filterFn: 'includesString',
    // sortingFn: (rowA, rowB, columnId) => {
    //   const nameA = rowA.getValue<string>(columnId) || ''
    //   const nameB = rowB.getValue<string>(columnId) || ''

    //   // 使用中文本地化排序（推荐）
    //   return nameA.localeCompare(nameB, 'zh-CN', {
    //     sensitivity: 'accent',
    //     numeric: true,
    //   })
    // },
    sortingFn: zhTextSortFn,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.getValue('username')}
        </div>
      )
    },
  },
  // 性别
  {
    accessorKey: 'gender',
    header: ({ column }) => {
      const filterValue = column.getFilterValue() as number ?? ''

      const handleSelect = (val: string) => {
        if (val === '') {
          column.setFilterValue('')
        }
        else {
          column.setFilterValue(Number(val))
        }
      }

      return (
        <RadioHeader
          id="gender"
          defaultValue={filterValue}
          onSelect={handleSelect}
          selectMap={genderRadioMap}
        >
          <span>性别</span>

        </RadioHeader>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {
            row.getValue('gender') === 1 ? '男' : '女'
          }
        </div>
      )
    },
    filterFn: 'equals',
  },
  // 年龄
  {
    id: 'age',
    accessorFn: row => row.user.detail.age,
    // accessorKey: 'age',
    header: ({ column }) => {
      const currentSort = column.getIsSorted()
      const handleClick = () => {
        const nextSort = getNextSort(currentSort)
        column.toggleSorting(nextSort ? nextSort === 'desc' : undefined)
      }
      return (
        <Button
          variant="ghost"
          size="sm"
          className=""
          onClick={handleClick}
        >
          年龄
          {}
          {currentSort === 'desc' && <ArrowDownIcon />}
          {currentSort === 'asc' && <ArrowUpIcon />}
          {!currentSort && <ArrowUpDownIcon />}
        </Button>
      )
    },
    sortingFn: 'basic', // 复杂排序可自定义排序函数
    cell: ({ row }) => {
      const age = row.getValue('age') as number
      return (
        <span className="flex justify-center">
          {age}
        </span>
      )
    },

  },
  // 身份证号
  {
    accessorKey: 'idCard',
    header: ({ column }) => {
      let filterValue = column.getFilterValue() as string ?? ''

      const currentSort = column.getIsSorted().toString() as SortValueType

      const handleSortValueChange = (val: 'desc' | 'asc' | 'false') => {
        if (val === 'false') {
          column.clearSorting()
        }
        else {
          column.toggleSorting(val === 'desc')
        }
      }
      const handleFilterValueChange = (val: string) => {
        if (!val) {
          column.setFilterValue('')
        }
        else {
          column.setFilterValue(val)
        }
        filterValue = val
      }

      return (
        <SortFilterHeader<string>
          id="idCard"
          filterValue={filterValue}
          onFilterChange={handleFilterValueChange}
          sortValue={currentSort}
          onSortChange={handleSortValueChange}
        >
          <span>身份证号</span>
        </SortFilterHeader>

      )
    },
    sortingFn: 'basic',
    filterFn: 'includesString',
  },
  // 邮箱
  {
    accessorKey: 'email',
    header: ({ column }) => {
      let filterValue = column.getFilterValue() as string ?? ''

      const currentSort = column.getIsSorted().toString() as SortValueType

      const handleSortValueChange = (val: 'desc' | 'asc' | 'false') => {
        if (val === 'false') {
          column.clearSorting()
        }
        else {
          column.toggleSorting(val === 'desc')
        }
      }
      const handleFilterValueChange = (val: string) => {
        if (!val) {
          column.setFilterValue('')
        }
        else {
          column.setFilterValue(val)
        }
        filterValue = val
      }

      return (
        <SortFilterHeader<string>
          id="email"
          filterValue={filterValue}
          onFilterChange={handleFilterValueChange}
          sortValue={currentSort}
          onSortChange={handleSortValueChange}
        >
          <span>邮箱</span>
        </SortFilterHeader>

      )
    },
    sortingFn: 'text',

    filterFn: 'includesString',
  },
  // 地址
  {
    accessorKey: 'address',
    header: ({ column }) => {
      let filterValue = column.getFilterValue() as string ?? ''

      const currentSort = column.getIsSorted().toString() as SortValueType

      const handleSortValueChange = (val: 'desc' | 'asc' | 'false') => {
        if (val === 'false') {
          column.clearSorting()
        }
        else {
          column.toggleSorting(val === 'desc')
        }
      }
      const handleFilterValueChange = (val: string) => {
        if (!val) {
          column.setFilterValue('')
        }
        else {
          column.setFilterValue(val)
        }
        filterValue = val
      }

      return (
        <SortFilterHeader<string>
          id="address"
          filterValue={filterValue}
          onFilterChange={handleFilterValueChange}
          sortValue={currentSort}
          onSortChange={handleSortValueChange}
        >
          <span>地址</span>
        </SortFilterHeader>

      )
    },
    sortingFn: zhTextSortFn,
    filterFn: 'includesString',
  },

  {
    accessorKey: 'status',
    header: ({ column }) => {
      let filterValue = column.getFilterValue() as string ?? ''

      const handleSelect = (val: string) => {
        if (!val) {
          column.setFilterValue('')
        }
        else {
          column.setFilterValue(val)
        }
        filterValue = val
      }

      return (

        <RadioHeader
          id="status"
          defaultValue={filterValue}
          onSelect={handleSelect}
          selectMap={statusRadioMap}
        >
          <span>状态</span>

        </RadioHeader>

      )
    },
    cell: ({ row, table }) => {
      const handleCheckedChange = (newVal: boolean) => {
        const onStatusChange = table.options.meta?.onStatusChange
        if (typeof onStatusChange === 'function') {
          const params = {
            id: row.original.id,
            status: newVal ? 0 : 1,
          }
          onStatusChange(params)
        }
      }
      const value = row.getValue('status') as number === 1
      return (

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="flex items-center space-x-2">
              <Switch checked={value} size="sm" />
              <Label htmlFor="airplane-mode">启用</Label>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>温馨提示</AlertDialogTitle>
              <AlertDialogDescription>
                确定
                {value ? '禁用' : '启用'}
                {row.original.username}
                的状态
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => handleCheckedChange(!value)}>确认</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    },
    filterFn: 'includesString',
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
        <div className="flex items-center justify-center gap-2">
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
