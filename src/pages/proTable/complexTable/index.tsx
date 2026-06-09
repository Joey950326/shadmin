import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import type { Api } from '@/services/api/types/api'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowRightIcon, ChevronsDownUpIcon, ChevronsUpDownIcon, ImportIcon, SearchIcon, TextAlignStartIcon } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { DatetimeSelect } from '@/components/datetimeSelect'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useAvatarUpload, useDeleteUser, useEditUser, useUserList } from '@/services/api/hooks/useUser'
import { getDateNow } from '@/utils'
import { columns } from './columns'
import AddUserButton from './components/AddUserButton'

interface ComplexTableProps<T> {
  columns: ColumnDef<T>[]
  fetchTableData: (params: Api.User.ListParams) => UseQueryResult<Api.User.ListResponse, unknown>
  className?: string
  onRowDelete: UseMutationResult<Api.User.DeleteResponse, unknown, Api.User.DeleteParams>
  onRowEdit: UseMutationResult<Api.User.EditResponse, unknown, Api.User.EditParams>
  onAvatarUpload: UseMutationResult<Api.User.AvatarUploadResponse, unknown, Api.User.AvatarUploadParams>
}

interface SelectDateTimeDef {
  from?: Date
  to?: Date
}

const now = getDateNow()

function ComplexTable({
  columns,
  fetchTableData,
  className,
  onRowDelete,
  onRowEdit,
  onAvatarUpload,
}: ComplexTableProps<Api.User.UserInfo>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const fetchParams = useMemo(() => ({
    type: 1,
    startTime: '2022-11-12 11:35:00',
    endTime: '2022-12-12 11:35:00',
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  }), [pagination.pageIndex, pagination.pageSize])

  const { data: res, isFetching, refetch } = fetchTableData(fetchParams)

  const tableData = res?.data?.list ?? []
  const total = res?.data?.total ?? 0
  const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize), [total, pagination.pageSize])

  const handleDeleteConfirm = useCallback((rowId: string) => {
    const deleteParams = { id: [rowId] }
    onRowDelete.mutate(deleteParams, {
      onSuccess: () => {
        toast.success('删除成功', {
          position: 'top-right',
        })
      },
      onError: (error) => {
        console.error('删除失败', error)
        toast.error('删除失败', {
          position: 'top-right',
        })
      },
      onSettled: () => {
        refetch()
      },
    })
  }, [onRowDelete, refetch])

  const handleEdit = useCallback((data: Api.User.UserInfo, cb?: () => void) => {
    onRowEdit.mutate(data, {
      onSuccess: () => {
        toast.success('编辑成功', {
          position: 'top-right',
        })
      },
      onError: (error) => {
        console.error('编辑失败', error)
        toast.error('编辑失败', {
          position: 'top-right',
        })
      },
      onSettled: () => {
        cb?.()
        refetch()
      },
    })
  }, [onRowEdit, refetch])

  const handleAvatarUpload = useCallback((params: Api.User.AvatarUploadParams, successCb?: (data: Api.User.AvatarUploadResponse) => void, failCb?: (error: Error) => void) => {
    onAvatarUpload.mutate(params, {
      onSuccess: (data) => {
        toast.success('上传成功', {
          position: 'top-right',
        })
        successCb?.(data)
      },
      onError: (error) => {
        toast.error('上传失败', {
          position: 'top-right',
        })
        failCb?.(error as Error)
      },
    })
  }, [onAvatarUpload])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    meta: {
      onRowDelete: handleDeleteConfirm,
      deleteLoading: onRowDelete?.isPending,
      onRowEdit: handleEdit,
      onAvatarUpload: handleAvatarUpload,
    },
  })

  const calcPageRange = useMemo(() => {
    const startPage = Math.max(1, pagination.pageIndex + 1 - 3)
    const endPage = Math.min(pageCount, pagination.pageIndex + 1 + 3)
    const pageRange = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index)
    return pageRange
  }, [pageCount, pagination])

  const currentPage = useMemo(() => (pagination.pageIndex + 1).toString(), [pagination.pageIndex])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleJump = () => {
    if (inputRef.current) {
      const value = Number(inputRef.current?.value)
      if (value > 0 && value <= pageCount) {
        table.setPageIndex(value - 1)
      }
      else {
        toast.error('请输入正常范围的页码', {
          position: 'top-right',
        })
      }
    }
  }

  const [toolExpand, setToolExpand] = useState<boolean>(false)

  const [selectDatetime, setSelectDatetime] = useState<SelectDateTimeDef>({
    from: now,
    to: now,
  })

  return (
    <div className="relative h-full bg-background flex flex-col rounded-xl">
      {/* 加载遮罩 */}
      {isFetching && (
        <div className="absolute z-30 inset-0 flex justify-center items-center bg-foreground/20">
          <Spinner className="size-8" />
        </div>
      )}

      {/* 工具组件，筛选，排序等 */}
      <Collapsible
        open={toolExpand}
        onOpenChange={setToolExpand}
        className="flex items-start gap-2 p-2 "
      >
        <FieldGroup className="w-full">
          <FieldGroup className="flex flex-row">
            <FieldGroup className="flex-1 grid grid-cols-6 md:grid-cols-12 lg:grid-cols-18 items-center">
              <Field className="col-span-6">
                <ButtonGroup>
                  <Input placeholder="搜索用户名" />
                  <Button variant="outline" aria-label="Search">
                    <SearchIcon />
                  </Button>
                </ButtonGroup>
              </Field>
              <Field className="col-span-3">
                {/* <Button size="sm" variant="outline">
                  新增用户
                  <BadgePlusIcon />
                </Button> */}
                <AddUserButton onSuccessCb={refetch} />

              </Field>
              <Field className="col-span-3">
                <Button size="sm">
                  批量导入
                  <ImportIcon />
                </Button>
              </Field>
            </FieldGroup>

            <Drawer direction="right">
              <DrawerTrigger asChild>
                <Button className="shrink-0" size="sm" variant="outline">
                  <TextAlignStartIcon />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>表格设置</DrawerTitle>
                  <DrawerDescription>设置表格的列可见</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Submit</Button>
                  <DrawerClose>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

          </FieldGroup>

          <CollapsibleContent className="w-full">
            <FieldGroup className="grid grid-cols-12">
              <Field className="col-span-12 md:col-span-6 ">
                <FieldLabel>时间范围</FieldLabel>
                <DatetimeSelect value={selectDatetime} onChange={setSelectDatetime}></DatetimeSelect>
              </Field>
              <Field className="col-span-6 md:col-span-3">
                <FieldLabel className="pl-2">性别</FieldLabel>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">男</SelectItem>
                      <SelectItem value="2">女</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

              </Field>
              <Field className="col-span-6 md:col-span-3">
                <FieldLabel className="pl-2">用户状态</FieldLabel>
                <Select>
                  <SelectTrigger id="radius-x">
                    <SelectValue placeholder="请选择用户状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">启用</SelectItem>
                      <SelectItem value="2">禁用</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

              </Field>

              <Field className="col-span-6 md:col-span-4">
                <FieldLabel>
                  身份证号
                </FieldLabel>
                <Input placeholder="请输入身份证号码"></Input>
              </Field>

              <Field className="col-span-6 md:col-span-3">

                <FieldLabel className="pl-2">用户年龄</FieldLabel>
                <ButtonGroup>
                  <Input placeholder="请输入最小年龄" type="number" defaultValue={18} className="text-center" />
                  <ArrowRightIcon className="h-full bg-primary/5" size={14} />
                  <Input placeholder="请输入最大年龄" type="number" defaultValue={60} className="text-center" />
                </ButtonGroup>
              </Field>

            </FieldGroup>

          </CollapsibleContent>
        </FieldGroup>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            {!toolExpand ? <ChevronsUpDownIcon /> : <ChevronsDownUpIcon />}
          </Button>
        </CollapsibleTrigger>
      </Collapsible>

      {/* 表格组件 */}
      <div className={cn(
        'flex-1 rounded-md bg-card overflow-hidden',
        className,
      )}
      >
        <ScrollArea className="size-full">
          <Table
            containerClassName="overflow-visible"
            className="min-w-300 rounded-2xl"
          >
            <TableHeader className="sticky top-0 z-10 bg-muted shadow-xs">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.id === 'actions' && 'sticky right-0 bg-muted text-center border-l',
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === 'actions' && 'sticky right-0 bg-background border-l',
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* 分页组件 */}
      <div className="max-h-16 w-full shrink-0 flex p-2 overflow-hidden">
        <Pagination className="cursor-pointer">
          <PaginationContent>
            <PaginationItem className="hidden sm:block">
              <div className="flex items-center">
                <Button className=" rounded-r-none " variant="outline" size="sm" onClick={handleJump}>
                  跳转至
                </Button>
                <Input ref={inputRef} placeholder={currentPage} className="max-w-14 h-8 rounded-l-none" defaultValue={currentPage} />
              </div>
            </PaginationItem>

            {table.getCanPreviousPage() && (
              <PaginationItem>
                <PaginationPrevious text="上一页" onClick={() => table.previousPage()} />
              </PaginationItem>
            )}
            {
              calcPageRange.map((p) => {
                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => table.setPageIndex(p - 1)}
                      isActive={pagination.pageIndex === p - 1}
                      className="hover:bg-foreground/10 data-[active=true]:bg-primary/20"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              })
            }
            {
              table.getCanNextPage() && (
                <PaginationItem>
                  <PaginationNext text="下一页" onClick={() => table.nextPage()} />
                </PaginationItem>
              )
            }
            <PaginationItem className="hidden sm:block">
              {/* 每页条数 */}
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={value => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 条</SelectItem>
                  <SelectItem value="20">20 条</SelectItem>
                  <SelectItem value="50">50 条</SelectItem>
                  <SelectItem value="100">100 条</SelectItem>
                </SelectContent>
              </Select>
            </PaginationItem>
            <PaginationItem className="hidden sm:block">
              <span className="text-sm px-2">
                共
                {pageCount}
                页
              </span>
            </PaginationItem>

          </PaginationContent>
        </Pagination>
      </div>

    </div>

  )
}

export default function Index() {
  const tableColumns = useMemo(() => columns, [])
  const deleteMutation = useDeleteUser()
  const editMutation = useEditUser()
  const avatarUploadMutaiton = useAvatarUpload()

  return (
    <div className="size-full">
      <ComplexTable
        className="rounded-lg"
        onRowDelete={deleteMutation}
        onRowEdit={editMutation}
        columns={tableColumns}
        fetchTableData={useUserList}
        onAvatarUpload={avatarUploadMutaiton}
      />
    </div>
  )
}
