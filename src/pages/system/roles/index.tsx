import type { MouseEvent } from 'react'
import type { Api } from '@/services/api/types/api'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useDeleteRole,
  useRoleDetail,
  useRoleList,
} from '@/services/api/hooks/useRole'

const PAGE_SIZE = 10

export default function RoleListPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({
    roleName: '',
    roleCode: '',
    status: '',
  })
  const [query, setQuery] = useState<Api.Role.ListParams>({
    page: 1,
    pageSize: PAGE_SIZE,
  })
  const [selectedRoleId, setSelectedRoleId] = useState<string>()
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [deleteRoleIds, setDeleteRoleIds] = useState<string[]>([])
  const { data, isFetching } = useRoleList(query)
  const deleteRole = useDeleteRole()
  const { data: detail, isFetching: detailLoading } = useRoleDetail(
    { id: selectedRoleId ?? '' },
    Boolean(selectedRoleId),
  )
  const roles = data?.data?.list ?? []
  const total = data?.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const allPageRolesSelected
    = roles.length > 0
      && roles.every(role => selectedRoleIds.includes(role.id))

  const togglePageSelection = (checked: boolean) => {
    const pageIds = roles.map(role => role.id)
    setSelectedRoleIds(current =>
      checked
        ? [...new Set([...current, ...pageIds])]
        : current.filter(id => !pageIds.includes(id)),
    )
  }

  const toggleRoleSelection = (id: string, checked: boolean) => {
    setSelectedRoleIds(current =>
      checked
        ? [...new Set([...current, id])]
        : current.filter(roleId => roleId !== id),
    )
  }

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    try {
      await deleteRole.mutateAsync({ id: deleteRoleIds })
      toast.success(t('role.deleteSuccess'))
      setSelectedRoleIds(current =>
        current.filter(id => !deleteRoleIds.includes(id)),
      )
      setDeleteRoleIds([])
    }
    catch {
      toast.error(t('role.deleteFailed'))
    }
  }

  const handleSearch = () => {
    setQuery({
      page: 1,
      pageSize: PAGE_SIZE,
      ...(filters.roleName.trim() && { roleName: filters.roleName.trim() }),
      ...(filters.roleCode.trim() && { roleCode: filters.roleCode.trim() }),
      ...(filters.status !== '' && { status: Number(filters.status) as 0 | 1 }),
    })
  }

  const handleReset = () => {
    setFilters({ roleName: '', roleCode: '', status: '' })
    setQuery({ page: 1, pageSize: PAGE_SIZE })
  }

  return (
    <main className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t('role.title')}</h1>
      <section aria-label={t('role.filters')}>
        <FieldGroup className="flex flex-wrap items-end gap-3">
          <Field>
            <FieldLabel htmlFor="role-name">{t('role.name')}</FieldLabel>
            <Input
              id="role-name"
              value={filters.roleName}
              onChange={event =>
                setFilters(value => ({
                  ...value,
                  roleName: event.target.value,
                }))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="role-code">{t('role.code')}</FieldLabel>
            <Input
              id="role-code"
              value={filters.roleCode}
              onChange={event =>
                setFilters(value => ({
                  ...value,
                  roleCode: event.target.value,
                }))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="role-status">{t('common.status')}</FieldLabel>
            <Select
              value={filters.status}
              onValueChange={status =>
                setFilters(value => ({ ...value, status }))}
            >
              <SelectTrigger id="role-status" className="w-36">
                <SelectValue placeholder={t('role.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">{t('common.enabled')}</SelectItem>
                  <SelectItem value="0">{t('common.disabled')}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Button onClick={handleSearch}>{t('common.search')}</Button>
          <Button variant="outline" onClick={handleReset}>
            {t('common.reset')}
          </Button>
        </FieldGroup>
      </section>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {t('role.selectedCount', { count: selectedRoleIds.length })}
        </span>
        <Button
          variant="destructive"
          disabled={!selectedRoleIds.length || deleteRole.isPending}
          onClick={() => setDeleteRoleIds(selectedRoleIds)}
        >
          {t('role.deleteSelected')}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  aria-label={t('role.selectPage')}
                  checked={allPageRolesSelected}
                  onCheckedChange={checked =>
                    togglePageSelection(checked === true)}
                />
              </TableHead>
              <TableHead>{t('role.name')}</TableHead>
              <TableHead>{t('role.code')}</TableHead>
              <TableHead>{t('role.description')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead>{t('role.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role.id}>
                <TableCell>
                  <Checkbox
                    aria-label={t('role.selectRole', { name: role.roleName })}
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={checked =>
                      toggleRoleSelection(role.id, checked === true)}
                  />
                </TableCell>
                <TableCell>{role.roleName}</TableCell>
                <TableCell>{role.roleCode}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  {t(role.status === 1 ? 'common.enabled' : 'common.disabled')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRoleId(role.id)}
                    >
                      {t('common.view')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteRole.isPending}
                      onClick={() => setDeleteRoleIds([role.id])}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!roles.length && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  {isFetching ? t('common.loadingData') : t('common.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <nav
        aria-label={t('role.pagination')}
        className="flex items-center justify-end gap-3"
      >
        <span className="text-sm text-muted-foreground">
          {t('role.total', { total })}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={query.page <= 1 || isFetching}
          onClick={() =>
            setQuery(value => ({ ...value, page: value.page - 1 }))}
        >
          {t('common.pagination.previous')}
        </Button>
        <span className="text-sm">
          {query.page}
          {' '}
          /
          {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={query.page >= pageCount || isFetching}
          onClick={() =>
            setQuery(value => ({ ...value, page: value.page + 1 }))}
        >
          {t('common.pagination.next')}
        </Button>
      </nav>

      <AlertDialog
        open={deleteRoleIds.length > 0}
        onOpenChange={open =>
          !open && !deleteRole.isPending && setDeleteRoleIds([])}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('role.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                deleteRoleIds.length === 1
                  ? 'role.deleteSinglePrompt'
                  : 'role.deleteMultiplePrompt',
                { count: deleteRoleIds.length },
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRole.isPending}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteRole.isPending}
              onClick={handleDelete}
            >
              {deleteRole.isPending ? t('role.deleting') : t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(selectedRoleId)}
        onOpenChange={open => !open && setSelectedRoleId(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('role.detailTitle')}</DialogTitle>
            <DialogDescription>{t('role.detailDescription')}</DialogDescription>
          </DialogHeader>
          {detailLoading
            ? (
                <p>{t('common.loadingData')}</p>
              )
            : (
                detail?.data && (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="font-medium">{t('role.name')}</dt>
                    <dd>{detail.data.roleName}</dd>
                    <dt className="font-medium">{t('role.code')}</dt>
                    <dd>{detail.data.roleCode}</dd>
                    <dt className="font-medium">{t('role.description')}</dt>
                    <dd>{detail.data.description}</dd>
                    <dt className="font-medium">{t('common.status')}</dt>
                    <dd>
                      {t(
                        detail.data.status === 1
                          ? 'common.enabled'
                          : 'common.disabled',
                      )}
                    </dd>
                    <dt className="font-medium">{t('role.authorizedMenuIds')}</dt>
                    <dd>
                      {detail.data.menuIds.length
                        ? detail.data.menuIds.join(', ')
                        : t('common.noData')}
                    </dd>
                  </dl>
                )
              )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
