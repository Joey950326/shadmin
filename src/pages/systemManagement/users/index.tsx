import type { Api } from '@/services/api/types/api'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUserList } from '@/services/api/hooks/useUser'

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
  const params: Api.User.ListParams = {
    page,
    pageSize: 10,
    ...(filters.username && { username: filters.username }),
    ...(filters.phone && { phone: filters.phone }),
    ...(filters.gender && { gender: Number(filters.gender) }),
    ...(filters.status && { status: Number(filters.status) }),
  }
  const { data, isFetching } = useUserList(params)
  const rows = data?.data?.list ?? []
  const total = data?.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / params.pageSize))

  const updateFilter = (name: keyof UserFilters, value: string) => {
    setPage(1)
    setFilters(current => ({ ...current, [name]: value }))
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">{t('userManagement.title')}</h1>
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
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('userManagement.username')}</TableHead>
              <TableHead>{t('userManagement.phone')}</TableHead>
              <TableHead>{t('userManagement.gender')}</TableHead>
              <TableHead>{t('userManagement.status')}</TableHead>
              <TableHead>{t('userManagement.role')}</TableHead>
              <TableHead>{t('userManagement.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.phone ?? '—'}</TableCell>
                <TableCell>
                  {user.gender === 1
                    ? t('male')
                    : user.gender === 2
                      ? t('female')
                      : '—'}
                </TableCell>
                <TableCell>
                  {user.status === 1 ? t('enabled') : t('disabled')}
                </TableCell>
                <TableCell>
                  {typeof user.role === 'string'
                    ? user.role
                    : (user.role?.name ?? '—')}
                </TableCell>
                <TableCell>
                  <UserDetails user={user} />
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {isFetching ? t('loading') : t('noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
