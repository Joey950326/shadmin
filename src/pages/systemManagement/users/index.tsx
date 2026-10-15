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
  DialogTrigger,
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useDeleteUser,
  useStatusChange,
  useUserList,
} from '@/services/api/hooks/useUser'
import UserFormDialog from './UserFormDialog'

interface UserFilters {
  username: string
  phone: string
  gender: string
  status: string
}

const emptyFilters: UserFilters = {
  username: '',
  phone: '',
  gender: '',
  status: '',
}

function UserDetails({ user }: { user: Api.User.UserInfo }) {
  const { t } = useTranslation()
  const role = user.role
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t('view')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('userManagement.viewUser')}</DialogTitle>
          <DialogDescription>
            {t('userManagement.viewDescription')}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>{t('userManagement.username')}</FieldLabel>
            <Input readOnly value={user.username ?? ''} />
          </Field>
          <Field>
            <FieldLabel>{t('userManagement.email')}</FieldLabel>
            <Input readOnly value={user.email ?? ''} />
          </Field>
          <Field>
            <FieldLabel>{t('userManagement.phone')}</FieldLabel>
            <Input readOnly value={user.phone ?? ''} />
          </Field>
          <Field>
            <FieldLabel>{t('userManagement.gender')}</FieldLabel>
            <Input
              readOnly
              value={
                user.gender === 1
                  ? t('male')
                  : user.gender === 2
                    ? t('female')
                    : ''
              }
            />
          </Field>
          <Field>
            <FieldLabel>{t('userManagement.status')}</FieldLabel>
            <Input
              readOnly
              value={user.status === 1 ? t('enabled') : t('disabled')}
            />
          </Field>
          <Field>
            <FieldLabel>{t('userManagement.role')}</FieldLabel>
            <Input
              readOnly
              value={typeof role === 'string' ? role : (role?.name ?? '')}
            />
          </Field>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  )
}

export default function UserManagementPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<UserFilters>(emptyFilters)
  const [page, setPage] = useState(1)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [deleteUserIds, setDeleteUserIds] = useState<string[]>([])
  const params: Api.User.ListParams = {
    page,
    pageSize: 10,
    ...(filters.username && { username: filters.username }),
    ...(filters.phone && { phone: filters.phone }),
    ...(filters.gender && { gender: Number(filters.gender) }),
    ...(filters.status && { status: Number(filters.status) }),
  }
  const { data, isFetching } = useUserList(params)
  const deleteUser = useDeleteUser()
  const statusChange = useStatusChange()
  const rows = data?.data?.list ?? []
  const total = data?.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / params.pageSize))

  const allPageUsersSelected
    = rows.length > 0 && rows.every(user => selectedUserIds.includes(user.id))

  const togglePageSelection = (checked: boolean) => {
    const pageIds = rows.map(user => user.id)
    setSelectedUserIds(current =>
      checked
        ? [...new Set([...current, ...pageIds])]
        : current.filter(id => !pageIds.includes(id)),
    )
  }

  const toggleUserSelection = (id: string, checked: boolean) => {
    setSelectedUserIds(current =>
      checked
        ? [...new Set([...current, id])]
        : current.filter(userId => userId !== id),
    )
  }

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    try {
      await deleteUser.mutateAsync({ id: deleteUserIds })
      toast.success(t('userManagement.deleteSuccess'))
      setSelectedUserIds(current =>
        current.filter(id => !deleteUserIds.includes(id)),
      )
      setPage(current =>
        Math.min(
          current,
          Math.max(
            1,
            Math.ceil((total - deleteUserIds.length) / params.pageSize),
          ),
        ),
      )
      setDeleteUserIds([])
    }
    catch {
      toast.error(t('userManagement.deleteFailed'))
    }
  }

  const handleStatusChange = (user: Api.User.UserInfo, checked: boolean) => {
    const status = checked ? 1 : 0
    statusChange.mutate(
      { id: user.id, status },
      {
        onSuccess: () => toast.success(t('userManagement.statusChangeSuccess')),
        onError: () => toast.error(t('userManagement.statusChangeFailed')),
      },
    )
  }

  const updateFilter = (name: keyof UserFilters, value: string) => {
    setPage(1)
    setFilters(current => ({ ...current, [name]: value }))
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t('userManagement.title')}</h1>
        <UserFormDialog />
      </div>
      <FieldGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field>
          <FieldLabel htmlFor="filter-username">
            {t('userManagement.username')}
          </FieldLabel>
          <Input
            id="filter-username"
            value={filters.username}
            placeholder={t('userManagement.usernamePlaceholder')}
            onChange={event => updateFilter('username', event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="filter-phone">
            {t('userManagement.phone')}
          </FieldLabel>
          <Input
            id="filter-phone"
            value={filters.phone}
            placeholder={t('userManagement.phonePlaceholder')}
            onChange={event => updateFilter('phone', event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>{t('userManagement.gender')}</FieldLabel>
          <Select
            value={filters.gender || 'all'}
            onValueChange={value =>
              updateFilter('gender', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('userManagement.allGenders')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  {t('userManagement.allGenders')}
                </SelectItem>
                <SelectItem value="1">{t('male')}</SelectItem>
                <SelectItem value="2">{t('female')}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>{t('userManagement.status')}</FieldLabel>
          <Select
            value={filters.status || 'all'}
            onValueChange={value =>
              updateFilter('status', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('userManagement.allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  {t('userManagement.allStatuses')}
                </SelectItem>
                <SelectItem value="1">{t('enabled')}</SelectItem>
                <SelectItem value="0">{t('disabled')}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {t('userManagement.selectedCount', { count: selectedUserIds.length })}
        </span>
        <Button
          variant="destructive"
          disabled={!selectedUserIds.length || deleteUser.isPending}
          onClick={() => setDeleteUserIds(selectedUserIds)}
        >
          {t('userManagement.deleteSelected')}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table className="table-auto">
          <TableHeader className="[&_th]:text-center">
            <TableRow>
              <TableHead>
                <Checkbox
                  aria-label={t('userManagement.selectPage')}
                  checked={allPageUsersSelected}
                  onCheckedChange={checked =>
                    togglePageSelection(checked === true)}
                />
              </TableHead>
              <TableHead>{t('userManagement.username')}</TableHead>
              <TableHead>{t('userManagement.email')}</TableHead>
              <TableHead>{t('userManagement.phone')}</TableHead>
              <TableHead>{t('userManagement.gender')}</TableHead>
              <TableHead>{t('userManagement.status')}</TableHead>
              <TableHead>{t('userManagement.role')}</TableHead>
              <TableHead>{t('userManagement.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_td]:text-center [&_td>div]:justify-center">
            {rows.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    aria-label={t('userManagement.selectUser', {
                      name: user.username,
                    })}
                    checked={selectedUserIds.includes(user.id)}
                    onCheckedChange={checked =>
                      toggleUserSelection(user.id, checked === true)}
                  />
                </TableCell>
                <TableCell>
                  <span className="block max-w-40 truncate" title={user.username}>
                    {user.username}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="block max-w-52 truncate"
                    title={user.email ?? undefined}
                  >
                    {user.email ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="block max-w-36 truncate"
                    title={user.phone ?? undefined}
                  >
                    {user.phone ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  {user.gender === 1
                    ? t('male')
                    : user.gender === 2
                      ? t('female')
                      : '—'}
                </TableCell>
                <TableCell>
                  <Switch
                    aria-label={t('userManagement.toggleStatus', {
                      name: user.username,
                    })}
                    checked={user.status === 1}
                    disabled={statusChange.isPending}
                    onCheckedChange={checked =>
                      handleStatusChange(user, checked)}
                  />
                  <span className="sr-only">
                    {user.status === 1 ? t('enabled') : t('disabled')}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="block max-w-40 truncate"
                    title={typeof user.role === 'string' ? user.role : user.role?.name ?? undefined}
                  >
                    {typeof user.role === 'string'
                      ? user.role
                      : (user.role?.name ?? '—')}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <UserDetails user={user} />
                    <UserFormDialog key={user.id} user={user} />
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteUser.isPending}
                      onClick={() => setDeleteUserIds([user.id])}
                    >
                      {t('delete')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {isFetching ? t('loading') : t('noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={deleteUserIds.length > 0}
        onOpenChange={open =>
          !open && !deleteUser.isPending && setDeleteUserIds([])}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('userManagement.confirmDeleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('userManagement.confirmDelete', {
                count: deleteUserIds.length,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteUser.isPending}
              onClick={handleDelete}
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex items-center justify-end gap-3">
        <span className="text-sm text-muted-foreground">
          {t('userManagement.total', { count: total })}
        </span>
        <Button
          variant="outline"
          disabled={page <= 1 || isFetching}
          onClick={() => setPage(value => value - 1)}
        >
          {t('pagination.previous')}
        </Button>
        <span className="text-sm">
          {page}
          {' '}
          /
          {pageCount}
        </span>
        <Button
          variant="outline"
          disabled={page >= pageCount || isFetching}
          onClick={() => setPage(value => value + 1)}
        >
          {t('pagination.next')}
        </Button>
      </div>
    </main>
  )
}
