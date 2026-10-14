import type { Api } from '@/services/api/types/api'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getMenuTreeApi } from '@/services/api/modules/menu'

interface MenuRow {
  node: Api.Menu.Node
  depth: number
}

function filterMenuTree(nodes: Api.Menu.Node[], name: string, type: string, status: string, language: string): MenuRow[] {
  const rows: MenuRow[] = []
  const matching = new Map<Api.Menu.Node, boolean>()
  const matchesTree = (node: Api.Menu.Node): boolean => {
    const localizedName = language.startsWith('zh') ? node.nameZh : node.nameEn
    const matches = localizedName.toLocaleLowerCase().includes(name.trim().toLocaleLowerCase())
      && (type === 'all' || node.type === type)
      && (status === 'all' || String(node.status) === status)
    const result = matches || (node.children ?? []).some(matchesTree)
    matching.set(node, result)
    return result
  }
  const flatten = (node: Api.Menu.Node, depth: number) => {
    if (!matching.get(node)) {
      return
    }
    rows.push({ node, depth })
    ;(node.children ?? []).forEach(child => flatten(child, depth + 1))
  }
  nodes.forEach(matchesTree)
  nodes.forEach(node => flatten(node, 0))
  return rows
}

export default function MenuManagementPage() {
  const { t, i18n } = useTranslation()
  const [name, setName] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['system-menu-tree'],
    queryFn: getMenuTreeApi,
  })
  const nodes = useMemo(() => data?.data ?? [], [data])
  const rows = useMemo(
    () => filterMenuTree(nodes, name, type, status, i18n.resolvedLanguage ?? i18n.language),
    [nodes, name, type, status, i18n.language, i18n.resolvedLanguage],
  )

  const resetFilters = () => {
    setName('')
    setType('all')
    setStatus('all')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>{t('menu:system.menuTree')}</CardTitle>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Spinner data-icon="inline-start" /> : null}
            {t('menu:system.refresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-48 flex-col gap-2">
            <label htmlFor="menu-name-filter" className="text-sm font-medium">{t('menu:system.menuName')}</label>
            <Input id="menu-name-filter" value={name} onChange={event => setName(event.target.value)} placeholder={t('menu:system.searchName')} />
          </div>
          <div className="flex min-w-40 flex-col gap-2">
            <label htmlFor="menu-type-filter" className="text-sm font-medium">{t('menu:system.menuType')}</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="menu-type-filter"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('menu:system.allTypes')}</SelectItem>
                <SelectItem value="directory">{t('menu:system.directory')}</SelectItem>
                <SelectItem value="page">{t('menu:system.page')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-w-40 flex-col gap-2">
            <label htmlFor="menu-status-filter" className="text-sm font-medium">{t('menu:system.status')}</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="menu-status-filter"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('menu:system.allStatuses')}</SelectItem>
                <SelectItem value="1">{t('menu:system.enabled')}</SelectItem>
                <SelectItem value="0">{t('menu:system.disabled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={resetFilters}>{t('menu:system.reset')}</Button>
        </div>
        {isError && <p role="alert" className="text-sm text-destructive">{t('menu:system.loadFailed')}</p>}
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('menu:system.menuName')}</TableHead>
                <TableHead>{t('menu:system.menuType')}</TableHead>
                <TableHead>{t('menu:system.path')}</TableHead>
                <TableHead>{t('menu:system.sort')}</TableHead>
                <TableHead>{t('menu:system.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? <TableRow><TableCell colSpan={5} className="h-24 text-center"><Spinner className="mx-auto" /></TableCell></TableRow>
                : rows.length === 0
                  ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">{t('menu:system.noMenus')}</TableCell></TableRow>
                  : rows.map(({ node, depth }) => (
                      <TableRow key={node.id}>
                        <TableCell><span style={{ paddingInlineStart: `${depth * 1.5}rem` }}>{i18n.resolvedLanguage?.startsWith('zh') || i18n.language.startsWith('zh') ? node.nameZh : node.nameEn}</span></TableCell>
                        <TableCell>{t(`menu:system.${node.type}`)}</TableCell>
                        <TableCell>{node.path || '—'}</TableCell>
                        <TableCell>{node.sort}</TableCell>
                        <TableCell><Badge variant={node.status === 1 ? 'secondary' : 'outline'}>{node.status === 1 ? t('menu:system.enabled') : t('menu:system.disabled')}</Badge></TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
