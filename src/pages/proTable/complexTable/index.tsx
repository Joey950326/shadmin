import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { ColumnDef, PaginationState, VisibilityState } from '@tanstack/react-table'
import type { Api } from '@/services/api/types/api'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowRightIcon, ChevronsDownUpIcon, ChevronsUpDownIcon, DeleteIcon, DownloadIcon, ImportIcon, LoaderIcon, SearchIcon, TextAlignStartIcon } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { DatetimeSelect } from '@/components/datetimeSelect'
import { FileDownloader, FileDownloaderTrigger } from '@/components/fileDownloader'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useAvatarUpload, useDeleteUser, useEditUser, useStatusChange, useUserList } from '@/services/api/hooks/useUser'
import { getDateNow } from '@/utils'
import { columns } from './columns'
import AddUserButton from './components/AddUserButton'
import DeleteUserButton from './components/DeleteUserButton'
import UploaderDialog from './components/UploaderDialog'

interface ComplexTableProps<T> {
  columns: ColumnDef<T>[]
  fetchTableData: (params: Api.User.ListParams) => UseQueryResult<Api.User.ListResponse, unknown>
  className?: string
  onRowDelete: UseMutationResult<Api.User.DeleteResponse, unknown, Api.User.DeleteParams>
  onRowEdit: UseMutationResult<Api.User.EditResponse, unknown, Api.User.EditParams>
  onAvatarUpload: UseMutationResult<Api.User.AvatarUploadResponse, unknown, Api.User.AvatarUploadParams>
  onStatusChange: UseMutationResult<Api.User.StatusChangeResponse, unknown, Api.User.StatusChangeParams>
}

interface SelectDateTimeDef {
  from?: Date
  to?: Date
}

interface SearchValue {
  username?: string
  idCard?: string
  minAge?: string
  maxAge?: string
  status?: number
  gender?: number
  startTime?: string
  endTime?: string
}

const now = getDateNow()

function ComplexTable({
  columns,
  fetchTableData,
  className,
  onRowDelete,
  onRowEdit,
  onAvatarUpload,
  onStatusChange,
}: ComplexTableProps<Api.User.UserInfo>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [selectDatetime, setSelectDatetime] = useState<SelectDateTimeDef>({
    from: now,
    to: now,
  })

  // 全局筛选相关

  const [searchValue, setSearchValue] = useState<SearchValue>({
  })
  const [genderSelected, setGenderSelected] = useState<string>()
  const [statusSelected, setStatusSelected] = useState<string>()
  // 使用非受控组件处理全局搜索，提高性能
  const usernameInputRef = useRef<HTMLInputElement>(null)
  const idCardInputRef = useRef<HTMLInputElement>(null)
  const minAgeInputRef = useRef<HTMLInputElement>(null)
  const maxAgeInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = () => {
    const searchValue = Object.fromEntries(Object.entries({
      username: usernameInputRef.current?.value,
      idCard: idCardInputRef.current?.value,
      gender: genderSelected && Number(genderSelected),
      status: Number(statusSelected) !== 0 ? Number(statusSelected) : null,
      minAge: minAgeInputRef.current?.value,
      maxAge: maxAgeInputRef.current?.value,
      startTime: selectDatetime.from !== selectDatetime.to ? selectDatetime.from : '',
      endTime: selectDatetime.to,
    }).filter(([, value]) => value !== '' && value !== undefined && value !== null))
    setSearchValue(searchValue)
  }

  const handleResetSearch = () => {
    if (usernameInputRef.current) {
      usernameInputRef.current.value = ''
    }
    if (idCardInputRef.current) {
      idCardInputRef.current.value = ''
    }
    if (minAgeInputRef.current) {
      minAgeInputRef.current.value = '16'
    }
    if (maxAgeInputRef.current) {
      maxAgeInputRef.current.value = '60'
    }
    setStatusSelected('')
    setGenderSelected('')
    setSelectDatetime({ from: now, to: now })
  }

  const fetchParams = useMemo(() => ({
    type: 1,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    ...searchValue,

  }), [pagination, searchValue])

  const { data: res, isFetching, refetch } = fetchTableData(fetchParams)

  const tableData = res?.data?.list ?? []
  const total = res?.data?.total ?? 0
  const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize), [total, pagination.pageSize])

  const handleDeleteConfirm = useCallback((rowId: string | Array<string>, cb?: () => void) => {
    const deleteParams = Array.isArray(rowId) ? { id: rowId } : { id: [rowId] }
    return onRowDelete.mutate(deleteParams, {
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
        cb?.()
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

  const handleStatusChange = useCallback((params: Api.User.StatusChangeParams, successCb?: (data: Api.User.StatusChangeResponse) => void, failCb?: (error: Error) => void) => {
    onStatusChange.mutate(params, {
      onSuccess: (data) => {
        toast.success('修改成功', {
          position: 'top-right',
        })
        successCb?.(data)
      },
      onError: (error) => {
        toast.error('修改失败', {
          position: 'top-right',
        })
        failCb?.(error as Error)
      },
      onSettled: () => {
        refetch()
      },
    })
  }, [onStatusChange, refetch])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    // manualFiltering: true,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    pageCount,
    state: {
      columnVisibility,
      pagination,
    },
    meta: {
      onRowDelete: handleDeleteConfirm,
      deleteLoading: onRowDelete?.isPending,
      onRowEdit: handleEdit,
      onAvatarUpload: handleAvatarUpload,
      onStatusChange: handleStatusChange,
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

  const handleBatchDelete = useCallback(() => {
    const id = table.getFilteredSelectedRowModel().rows.map(r => r.original.id)
    handleDeleteConfirm(id, () => table.resetRowSelection())
  }, [handleDeleteConfirm, table])

  const handleResetVisible = () => {
    table.setColumnVisibility({})
  }

  const [isExportting, setIsExportting] = useState<boolean>(false)

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
            <FieldGroup className="flex-1 grid grid-cols-6 lg:grid-cols-12 items-center">
              <Field className="col-span-6">
                <ButtonGroup>
                  <Input ref={usernameInputRef} placeholder="搜索用户名" />
                  {
                    !toolExpand && (
                      <Button className={toolExpand ? 'hidden' : 'block'} variant="outline" aria-label="Search" onClick={handleSearch}>
                        <SearchIcon />
                      </Button>
                    )
                  }

                </ButtonGroup>
              </Field>
              <Field className="col-span-3">
                <AddUserButton onSuccessCb={refetch} />
              </Field>
              {/* <Field className="col-span-2">
                <UploaderDialog>
                  <Button size="sm">
                    批量导入
                    <ImportIcon className="hidden lg:block" />
                  </Button>
                </UploaderDialog>
              </Field>
              <Field className="col-span-2">
                <FileDownloader fileName="用户数据" onDownloadingChange={setIsExportting}>
                  <FileDownloaderTrigger>
                    <Button size="sm" variant="outline" disabled={isExportting}>
                      {isExportting ? <LoaderIcon /> : <DownloadIcon />}
                      {isExportting ? '导入数据中' : '导出数据'}

                    </Button>
                  </FileDownloaderTrigger>
                </FileDownloader>
              </Field> */}
              <Field className="col-span-3">
                <DeleteUserButton
                  onConfirm={handleBatchDelete}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                  >
                    批量删除
                    <DeleteIcon className="hidden lg:block" />
                  </Button>
                </DeleteUserButton>
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
                  <DrawerDescription>表格操作，设置表格的列可见</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col px-4 gap-4">
                  <FieldGroup className="gap-4">
                    <Field orientation="horizontal">
                      <Label htmlFor="username-visible" className="min-w-20">用户名：</Label>
                      <Switch id="username-visible" checked={true} disabled />
                    </Field>
                    <Field orientation="horizontal">
                      <Label htmlFor="status-visible" className="min-w-20">状态：</Label>
                      <Switch
                        id="status-visible"
                        checked={table.getColumn('status')?.getIsVisible()}
                        onCheckedChange={visible => table.getColumn('status')?.toggleVisibility(!!visible)}
                      />
                    </Field>
                    <Field orientation="horizontal">
                      <Label htmlFor="age-visible" className="min-w-20">年龄：</Label>
                      <Switch
                        id="age-visible"
                        checked={table.getColumn('age')?.getIsVisible()}
                        onCheckedChange={visible => table.getColumn('age')?.toggleVisibility(!!visible)}
                      />
                    </Field>
                    <Field orientation="horizontal">
                      <Label htmlFor="idcard-visible" className="min-w-20">身份证号：</Label>
                      <Switch
                        id="idcard-visible"
                        checked={table.getColumn('idCard')?.getIsVisible()}
                        onCheckedChange={visible => table.getColumn('idCard')?.toggleVisibility(!!visible)}
                      />
                    </Field>
                    <Field orientation="horizontal">
                      <Label htmlFor="gender-visible" className="min-w-20">性别：</Label>
                      <Switch
                        id="gender-visible"
                        checked={table.getColumn('gender')?.getIsVisible()}
                        onCheckedChange={visible => table.getColumn('gender')?.toggleVisibility(!!visible)}
                      />
                    </Field>

                    <Field orientation="horizontal">
                      <Label htmlFor="email-visible" className="min-w-20">邮箱：</Label>
                      <Switch
                        id="email-visible"
                        checked={table.getColumn('email')?.getIsVisible()}
                        onCheckedChange={visible => table.getColumn('email')?.toggleVisibility(!!visible)}
                      />
                    </Field>

                    <Field orientation="horizontal">
                      <Label htmlFor="address-visible" className="min-w-20">地址：</Label>
                      <Switch
                        id="address-visible"
                        checked={table.getColumn('address')?.getIsVisible()}
                        onCheckedChange={visible => table.getColumn('address')?.toggleVisibility(!!visible)}
                      />
                    </Field>

                    <Field orientation="horizontal">
                      <Label htmlFor="createTime-visible" className="min-w-20">创建时间：</Label>
                      <Switch
                        id="createTime-visible"
                        checked={table.getColumn('createTime')?.getIsVisible()}
                        onCheckedChange={visible => table.getColumn('createTime')?.toggleVisibility(!!visible)}
                      />
                    </Field>
                  </FieldGroup>
                  <FieldSeparator />
                  <FieldGroup className="gap-4">
                    <Field orientation="horizontal">
                      <Label>用户数据导入:</Label>
                      <UploaderDialog>
                        <Button size="sm" variant="outline">
                          批量导入
                          <ImportIcon className="hidden lg:block" />
                        </Button>
                      </UploaderDialog>
                    </Field>
                    <Field orientation="horizontal">
                      <Label>用户数据导出:</Label>
                      <FileDownloader fileName="用户数据" onDownloadingChange={setIsExportting}>
                        <FileDownloaderTrigger>
                          <Button size="sm" variant="outline" disabled={isExportting}>
                            {isExportting ? '导入数据中' : '导出数据'}
                            {isExportting ? <LoaderIcon /> : <DownloadIcon />}

                          </Button>
                        </FileDownloaderTrigger>
                      </FileDownloader>
                    </Field>
                  </FieldGroup>
                </div>
                <DrawerFooter>
                  <Button variant="outline" onClick={handleResetVisible}>重置</Button>
                  <DrawerClose asChild>
                    <Button>关闭</Button>
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
              {/* 性别 */}
              <Field className="col-span-6 md:col-span-3">
                <FieldLabel className="pl-2">性别</FieldLabel>
                <Select value={genderSelected} onValueChange={setGenderSelected}>
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
              {/* 用户状态 */}
              <Field className="col-span-6 md:col-span-3">
                <FieldLabel className="pl-2">用户状态</FieldLabel>
                <Select value={statusSelected} onValueChange={setStatusSelected}>
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
              {/* 身份证号 */}
              <Field className="col-span-6 md:col-span-4">
                <FieldLabel>
                  身份证号
                </FieldLabel>
                <Input ref={idCardInputRef} placeholder="请输入身份证号码"></Input>
              </Field>
              {/* 年龄范围 */}
              <Field className="col-span-6 md:col-span-3">
                <FieldLabel className="pl-2">用户年龄</FieldLabel>
                <ButtonGroup>
                  <Input ref={minAgeInputRef} placeholder="请输入最小年龄" type="number" defaultValue={18} className="text-center" />
                  <ArrowRightIcon className="h-full p-2 bg-primary/5" size={14} />
                  <Input ref={maxAgeInputRef} placeholder="请输入最大年龄" type="number" defaultValue={60} className="text-center" />
                </ButtonGroup>
              </Field>
            </FieldGroup>
            <div className="w-full flex justify-end gap-2 pt-4 md:pt-0">
              <Button variant="outline" onClick={handleResetSearch}>重置</Button>
              <Button onClick={handleSearch}>搜索</Button>
            </div>

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
  const statusChangeMutation = useStatusChange()

  return (
    <div className="size-full">
      <ComplexTable
        className="rounded-lg"
        onRowDelete={deleteMutation}
        onRowEdit={editMutation}
        columns={tableColumns}
        fetchTableData={useUserList}
        onAvatarUpload={avatarUploadMutaiton}
        onStatusChange={statusChangeMutation}
      />
    </div>
  )
}
