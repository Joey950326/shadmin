import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import type { Api } from '@/services/api/types/api'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { useDeleteUser, useUserList } from '@/services/api/hooks/useUser'
import { columns } from './columns'

interface BasicTableProps<T> {
  columns: ColumnDef<T>[]
  fetchTableData: (params: Api.User.ListParams) => UseQueryResult<Api.User.ListResponse, unknown>
  className?: string
  onRowDelete: UseMutationResult<Api.User.DeleteResponse, unknown, Api.User.DeleteParams>
}

function BasicTable({
  columns,
  fetchTableData,
  className,
  onRowDelete,
}: BasicTableProps<Api.User.UserInfo>) {
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

  return (
    <div className="relative h-full bg-background flex flex-col rounded-xl">
      {/* 加载遮罩 */}
      {isFetching && (
        <div className="absolute z-30 inset-0 flex justify-center items-center bg-foreground/20">
          <Spinner className="size-8" />
        </div>
      )}

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
      <div className="max-h-16 w-full shrink-0 flex p-2">
        <Pagination className="cursor-pointer">
          <PaginationContent>
            <PaginationItem>
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
            <PaginationItem>
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
            <PaginationItem>
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

  return (
    <div className="size-full">
      <BasicTable className="rounded-lg" onRowDelete={deleteMutation} columns={tableColumns} fetchTableData={useUserList} />
    </div>
  )
}
