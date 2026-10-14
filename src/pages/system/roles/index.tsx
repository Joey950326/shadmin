import type { Api } from '@/services/api/types/api'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRoleDetail, useRoleList } from '@/services/api/hooks/useRole'

const PAGE_SIZE = 10

export default function RoleListPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({ roleName: '', roleCode: '', status: '' })
  const [query, setQuery] = useState<Api.Role.ListParams>({ page: 1, pageSize: PAGE_SIZE })
  const [selectedRoleId, setSelectedRoleId] = useState<string>()
  const { data, isFetching } = useRoleList(query)
  const { data: detail, isFetching: detailLoading } = useRoleDetail({ id: selectedRoleId ?? '' }, Boolean(selectedRoleId))
  const roles = data?.data?.list ?? []
  const total = data?.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
            <Input id="role-name" value={filters.roleName} onChange={event => setFilters(value => ({ ...value, roleName: event.target.value }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="role-code">{t('role.code')}</FieldLabel>
            <Input id="role-code" value={filters.roleCode} onChange={event => setFilters(value => ({ ...value, roleCode: event.target.value }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="role-status">{t('common.status')}</FieldLabel>
            <Select value={filters.status} onValueChange={status => setFilters(value => ({ ...value, status }))}>
              <SelectTrigger id="role-status" className="w-36"><SelectValue placeholder={t('role.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">{t('common.enabled')}</SelectItem>
                  <SelectItem value="0">{t('common.disabled')}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Button onClick={handleSearch}>{t('common.search')}</Button>
          <Button variant="outline" onClick={handleReset}>{t('common.reset')}</Button>
        </FieldGroup>
      </section>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell>{role.roleName}</TableCell>
                <TableCell>{role.roleCode}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>{t(role.status === 1 ? 'common.enabled' : 'common.disabled')}</TableCell>
                <TableCell><Button variant="outline" size="sm" onClick={() => setSelectedRoleId(role.id)}>{t('common.view')}</Button></TableCell>
              </TableRow>
            ))}
            {!roles.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{isFetching ? t('common.loadingData') : t('common.noData')}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <nav aria-label={t('role.pagination')} className="flex items-center justify-end gap-3">
        <span className="text-sm text-muted-foreground">{t('role.total', { total })}</span>
        <Button variant="outline" size="sm" disabled={query.page <= 1 || isFetching} onClick={() => setQuery(value => ({ ...value, page: value.page - 1 }))}>{t('common.pagination.previous')}</Button>
        <span className="text-sm">
          {query.page}
          {' '}
          /
          {' '}
          {pageCount}
        </span>
        <Button variant="outline" size="sm" disabled={query.page >= pageCount || isFetching} onClick={() => setQuery(value => ({ ...value, page: value.page + 1 }))}>{t('common.pagination.next')}</Button>
      </nav>

      <Dialog open={Boolean(selectedRoleId)} onOpenChange={open => !open && setSelectedRoleId(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('role.detailTitle')}</DialogTitle>
            <DialogDescription>{t('role.detailDescription')}</DialogDescription>
          </DialogHeader>
          {detailLoading
            ? <p>{t('common.loadingData')}</p>
            : detail?.data && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="font-medium">{t('role.name')}</dt>
                <dd>{detail.data.roleName}</dd>
                <dt className="font-medium">{t('role.code')}</dt>
                <dd>{detail.data.roleCode}</dd>
                <dt className="font-medium">{t('role.description')}</dt>
                <dd>{detail.data.description}</dd>
                <dt className="font-medium">{t('common.status')}</dt>
                <dd>{t(detail.data.status === 1 ? 'common.enabled' : 'common.disabled')}</dd>
                <dt className="font-medium">{t('role.authorizedMenuIds')}</dt>
                <dd>{detail.data.menuIds.length ? detail.data.menuIds.join(', ') : t('common.noData')}</dd>
              </dl>
            )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
