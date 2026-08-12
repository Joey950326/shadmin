import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import type { Api } from '@/services/api/types/api'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useAvatarUpload, useDeleteUser, useEditUser, useUserList } from '@/services/api/hooks/useUser'
import { createColumns } from './columns'

interface BasicTableProps<T> {
  columns: ColumnDef<T>[]
  fetchTableData: (params: Api.User.ListParams) => UseQueryResult<Api.User.ListResponse, unknown>
  className?: string
  onRowDelete: UseMutationResult<Api.User.DeleteResponse, unknown, Api.User.DeleteParams>
  onRowEdit: UseMutationResult<Api.User.EditResponse, unknown, Api.User.EditParams>
  onAvatarUpload: UseMutationResult<Api.User.AvatarUploadResponse, unknown, Api.User.AvatarUploadParams>
}

function BasicTable({
  columns,
  fetchTableData,
  className,
  onRowDelete,
  onRowEdit,
  onAvatarUpload,
}: BasicTableProps<Api.User.UserInfo>) {
  const { t } = useTranslation()
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

  const handleDeleteConfirm = useCallback((rowId: string | Array<string>) => {
    const deleteParams = { id: Array.isArray(rowId) ? rowId : [rowId] }
    onRowDelete.mutate(deleteParams, {
      onSuccess: () => {
        toast.success(t('table.deleteSuccess'), {
          position: 'top-right',
        })
      },
      onError: (error) => {
        console.error('删除失败', error)
        toast.error(t('table.deleteFailed'), {
          position: 'top-right',
        })
      },
      onSettled: () => {
        refetch()
      },
    })
  }, [onRowDelete, refetch, t])

  const handleEdit = useCallback((data: Api.User.UserInfo, cb?: () => void) => {
    onRowEdit.mutate(data, {
      onSuccess: () => {
        toast.success(t('table.editSuccess'), {
          position: 'top-right',
        })
      },
      onError: (error) => {
        console.error('编辑失败', error)
        toast.error(t('table.editFailed'), {
          position: 'top-right',
        })
      },
      onSettled: () => {
        cb?.()
        refetch()
      },
    })
  }, [onRowEdit, refetch, t])

  const handleAvatarUpload = useCallback((params: Api.User.AvatarUploadParams, successCb?: (data: Api.User.AvatarUploadResponse) => void, failCb?: (error: Error) => void) => {
    onAvatarUpload.mutate(params, {
      onSuccess: (data) => {
        toast.success(t('table.uploadSuccess'), {
          position: 'top-right',
        })
        successCb?.(data)
      },
      onError: (error) => {
        toast.error(t('table.uploadFailed'), {
          position: 'top-right',
        })
        failCb?.(error as Error)
      },
    })
  }, [onAvatarUpload, t])

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
        toast.error(t('table.invalidPage'), {
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
      <div className="max-h-16 w-full shrink-0 flex p-2 overflow-hidden">
        <Pagination className="cursor-pointer">
          <PaginationContent>
            <PaginationItem className="hidden sm:block">
              <div className="flex items-center">
                <Button className=" rounded-r-none " variant="outline" size="sm" onClick={handleJump}>
                  {t('table.pageJump')}
                </Button>
                <Input ref={inputRef} placeholder={currentPage} className="max-w-14 h-8 rounded-l-none" defaultValue={currentPage} />
              </div>
            </PaginationItem>

            {table.getCanPreviousPage() && (
              <PaginationItem>
                <PaginationPrevious text={t('pagination.previous')} onClick={() => table.previousPage()} />
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
                  <PaginationNext text={t('pagination.next')} onClick={() => table.nextPage()} />
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
                  <SelectItem value="10">{t('table.itemsPerPage', { count: 10 })}</SelectItem>
                  <SelectItem value="20">{t('table.itemsPerPage', { count: 20 })}</SelectItem>
                  <SelectItem value="50">{t('table.itemsPerPage', { count: 50 })}</SelectItem>
                  <SelectItem value="100">{t('table.itemsPerPage', { count: 100 })}</SelectItem>
                </SelectContent>
              </Select>
            </PaginationItem>
            <PaginationItem className="hidden sm:block">
              <span className="text-sm px-2">
                {t('table.totalPages', { count: pageCount })}
              </span>
            </PaginationItem>

          </PaginationContent>
        </Pagination>
      </div>
    </div>

  )
}

export default function Index() {
  const { t } = useTranslation()
  const tableColumns = useMemo(() => createColumns(t), [t])
  const deleteMutation = useDeleteUser()
  const editMutation = useEditUser()
  const avatarUploadMutaiton = useAvatarUpload()

  return (
    <div className="size-full">
      <BasicTable
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
