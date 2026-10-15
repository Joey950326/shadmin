import type { Api } from '@/services/api/types/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import dynamicRoutes from '@/routers/modules/dynamicRoutes'
import {
  addMenuApi,
  deleteMenuApi,
  editMenuApi,
  getMenuTreeApi,
} from '@/services/api/modules/menu'

interface MenuRow {
  node: Api.Menu.Node
  depth: number
}

interface MenuFormValues {
  nameZh: string
  nameEn: string
  parentId: string
  type: Api.Menu.Node['type']
  path: string
  icon: string
  sort: string
  status: '0' | '1'
}

const emptyMenu: MenuFormValues = {
  nameZh: '',
  nameEn: '',
  parentId: '',
  type: 'directory',
  path: '',
  icon: '',
  sort: '0',
  status: '1',
}

function filterMenuTree(
  nodes: Api.Menu.Node[],
  name: string,
  language: string,
): MenuRow[] {
  const rows: MenuRow[] = []
  const matching = new Map<Api.Menu.Node, boolean>()
  const matchesTree = (node: Api.Menu.Node): boolean => {
    const localizedName = language.startsWith('zh') ? node.nameZh : node.nameEn
    const matches = localizedName
      .toLocaleLowerCase()
      .includes(name.trim().toLocaleLowerCase())
    const result = matches || (node.children ?? []).some(matchesTree)
    matching.set(node, result)
    return result
  }
  const flatten = (node: Api.Menu.Node, depth: number) => {
    if (!matching.get(node)) {
      return
    }
    rows.push({ node, depth });
    (node.children ?? []).forEach(child => flatten(child, depth + 1))
  }
  nodes.forEach(matchesTree)
  nodes.forEach(node => flatten(node, 0))
  return rows
}

function flattenMenus(nodes: Api.Menu.Node[]): Api.Menu.Node[] {
  return nodes.flatMap(node => [node, ...flattenMenus(node.children ?? [])])
}

interface RouteLike { path?: string, children?: RouteLike[] }

function getRegisteredPaths(routes: RouteLike[], parentPath = ''): string[] {
  return routes.flatMap((route) => {
    const path = route.path
    const fullPath = !path
      ? parentPath
      : path.startsWith('/')
        ? path
        : `${parentPath.replace(/\/$/, '')}/${path}`
    const current
      = path && path !== '*' && !path.includes('*') ? [fullPath] : []
    return [...current, ...getRegisteredPaths(route.children ?? [], fullPath)]
  })
}

function menuFormValues(node?: Api.Menu.Node, parentId = ''): MenuFormValues {
  if (!node) {
    return { ...emptyMenu, parentId }
  }
  return {
    nameZh: node.nameZh,
    nameEn: node.nameEn,
    parentId: node.parentId ?? '',
    type: node.type,
    path: node.path ?? '',
    icon: node.icon ?? '',
    sort: String(node.sort),
    status: String(node.status) as '0' | '1',
  }
}

function MenuFormDialog({
  node,
  initialParentId,
  nodes,
  onOpenChange,
  onSaved,
}: {
  node?: Api.Menu.Node
  initialParentId: string
  nodes: Api.Menu.Node[]
  onOpenChange: (open: boolean) => void
  onSaved: () => Promise<unknown>
}) {
  const { t } = useTranslation()
  const [values, setValues] = useState(() =>
    menuFormValues(node, initialParentId),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const descendants = useMemo(() => {
    if (!node)
      return new Set<string>()
    const ids = new Set<string>()
    const collect = (current: Api.Menu.Node) => {
      ids.add(current.id);
      (current.children ?? []).forEach(collect)
    }
    collect(node)
    return ids
  }, [node])
  const parents = flattenMenus(nodes).filter(
    menu => menu.type === 'directory' && !descendants.has(menu.id),
  )
  const registeredPaths = useMemo(
    () => [...new Set(getRegisteredPaths(dynamicRoutes as RouteLike[]))].sort(),
    [],
  )

  const update = <K extends keyof MenuFormValues>(
    key: K,
    value: MenuFormValues[K],
  ) => {
    setError(false)
    setValues(current => ({
      ...current,
      [key]: value,
      ...(key === 'type' && value === 'directory' ? { path: '' } : {}),
    }))
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !values.nameZh.trim()
      || !values.nameEn.trim()
      || !Number.isFinite(Number(values.sort))
      || (values.type === 'page' && !registeredPaths.includes(values.path))
    ) {
      setError(true)
      return
    }
    setSubmitting(true)
    setError(false)
    const payload: Api.Menu.MutationParams = {
      nameZh: values.nameZh.trim(),
      nameEn: values.nameEn.trim(),
      ...(values.parentId && { parentId: values.parentId }),
      type: values.type,
      ...(values.type === 'page' && { path: values.path }),
      ...(values.icon.trim() && { icon: values.icon.trim() }),
      sort: Number(values.sort),
      status: Number(values.status) as 0 | 1,
    }
    try {
      if (node) {
        await editMenuApi({ ...payload, id: node.id })
      }
      else {
        await addMenuApi(payload)
      }
      await onSaved()
      toast.success(t('menu:system.saveSuccess'))
      onOpenChange(false)
    }
    catch {
      setError(true)
      toast.error(t('menu:system.saveFailed'))
    }
    finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {t(node ? 'menu:system.editMenu' : 'menu:system.addMenu')}
          </DialogTitle>
          <DialogDescription>
            {t('menu:system.formDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="menu-name-zh">
                {t('menu:system.nameZh')}
              </FieldLabel>
              <Input
                id="menu-name-zh"
                value={values.nameZh}
                aria-invalid={error && !values.nameZh.trim()}
                onChange={event => update('nameZh', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="menu-name-en">
                {t('menu:system.nameEn')}
              </FieldLabel>
              <Input
                id="menu-name-en"
                value={values.nameEn}
                aria-invalid={error && !values.nameEn.trim()}
                onChange={event => update('nameEn', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>{t('menu:system.parentMenu')}</FieldLabel>
              <Select
                value={values.parentId || 'root'}
                onValueChange={value =>
                  update('parentId', value === 'root' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="root">
                      {t('menu:system.rootMenu')}
                    </SelectItem>
                    {parents.map(parent => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.nameZh}
                        {' '}
                        /
                        {parent.nameEn}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>{t('menu:system.menuType')}</FieldLabel>
              <Select
                value={values.type}
                onValueChange={value =>
                  update('type', value as MenuFormValues['type'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="directory">
                      {t('menu:system.directory')}
                    </SelectItem>
                    <SelectItem value="page">
                      {t('menu:system.page')}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            {values.type === 'page' && (
              <Field className="sm:col-span-2">
                <FieldLabel>{t('menu:system.path')}</FieldLabel>
                <Select
                  value={values.path}
                  onValueChange={value => update('path', value)}
                >
                  <SelectTrigger
                    aria-invalid={
                      error && !registeredPaths.includes(values.path)
                    }
                  >
                    <SelectValue placeholder={t('menu:system.selectRoute')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {registeredPaths.map(path => (
                        <SelectItem key={path} value={path}>
                          {path}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="menu-icon">
                {t('menu:system.icon')}
              </FieldLabel>
              <Input
                id="menu-icon"
                value={values.icon}
                onChange={event => update('icon', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="menu-sort">
                {t('menu:system.sort')}
              </FieldLabel>
              <Input
                id="menu-sort"
                type="number"
                value={values.sort}
                aria-invalid={error && !Number.isFinite(Number(values.sort))}
                onChange={event => update('sort', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>{t('menu:system.status')}</FieldLabel>
              <Select
                value={values.status}
                onValueChange={value => update('status', value as '0' | '1')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">
                      {t('menu:system.enabled')}
                    </SelectItem>
                    <SelectItem value="0">
                      {t('menu:system.disabled')}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {t('menu:system.validationOrSaveFailed')}
            </p>
          )}
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t('menu:system.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner data-icon="inline-start" /> : null}
              {t('menu:system.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function MenuManagementPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [formState, setFormState] = useState<{
    node?: Api.Menu.Node
    parentId: string
  } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Api.Menu.Node | null>(null)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['system-menu-tree'],
    queryFn: getMenuTreeApi,
  })
  const nodes = useMemo(() => data?.data ?? [], [data])
  const rows = useMemo(
    () =>
      filterMenuTree(
        nodes,
        name,
        i18n.resolvedLanguage ?? i18n.language,
      ),
    [nodes, name, i18n.language, i18n.resolvedLanguage],
  )

  const resetFilters = () => {
    setName('')
  }

  const updateStatus = async (node: Api.Menu.Node) => {
    setPendingActionId(node.id)
    try {
      await editMenuApi({
        id: node.id,
        nameZh: node.nameZh,
        nameEn: node.nameEn,
        ...(node.parentId !== undefined && { parentId: node.parentId }),
        type: node.type,
        ...(node.path !== undefined && { path: node.path }),
        ...(node.icon !== undefined && { icon: node.icon }),
        sort: node.sort,
        status: node.status === 1 ? 0 : 1,
      })
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ['authorized-navigation'] }),
      ])
      toast.success(t('menu:system.statusUpdated'))
    }
    catch {
      toast.error(t('menu:system.statusUpdateFailed'))
    }
    finally {
      setPendingActionId(null)
    }
  }

  const deleteMenu = async () => {
    if (!deleteTarget) {
      return
    }
    const target = deleteTarget
    setPendingActionId(target.id)
    try {
      await deleteMenuApi({ id: target.id })
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ['authorized-navigation'] }),
      ])
      toast.success(t('menu:system.deleteSuccess'))
      setDeleteTarget(null)
    }
    catch {
      toast.error(t('menu:system.deleteFailed'))
    }
    finally {
      setPendingActionId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>{t('menu:system.menuTree')}</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setFormState({ parentId: '' })}>
              {t('menu:system.addMenu')}
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? <Spinner data-icon="inline-start" /> : null}
              {t('menu:system.refresh')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-48 flex-col gap-2">
            <label htmlFor="menu-name-filter" className="text-sm font-medium">
              {t('menu:system.menuName')}
            </label>
            <Input
              id="menu-name-filter"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder={t('menu:system.searchName')}
            />
          </div>
          <Button variant="outline" onClick={resetFilters}>
            {t('menu:system.reset')}
          </Button>
        </div>
        {isError && (
          <p role="alert" className="text-sm text-destructive">
            {t('menu:system.loadFailed')}
          </p>
        )}
        <div className="overflow-x-auto rounded-md border">
          <Table className="table-auto">
            <TableHeader className="[&_th]:text-center">
              <TableRow>
                <TableHead>{t('menu:system.menuName')}</TableHead>
                <TableHead>{t('menu:system.menuType')}</TableHead>
                <TableHead>{t('menu:system.path')}</TableHead>
                <TableHead>{t('menu:system.sort')}</TableHead>
                <TableHead>{t('menu:system.status')}</TableHead>
                <TableHead>{t('menu:system.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_td]:text-center [&_td>div]:justify-center">
              {isLoading
                ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Spinner className="mx-auto" />
                      </TableCell>
                    </TableRow>
                  )
                : rows.length === 0
                  ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {t('menu:system.noMenus')}
                        </TableCell>
                      </TableRow>
                    )
                  : (
                      rows.map(({ node, depth }) => (
                        <TableRow key={node.id}>
                          <TableCell>
                            <span
                              className="block max-w-64 truncate"
                              style={{ paddingInlineStart: `${depth * 1.5}rem` }}
                            >
                              {i18n.resolvedLanguage?.startsWith('zh')
                                || i18n.language.startsWith('zh')
                                ? node.nameZh
                                : node.nameEn}
                            </span>
                          </TableCell>
                          <TableCell>{t(`menu:system.${node.type}`)}</TableCell>
                          <TableCell>
                            <span className="block max-w-48 truncate">
                              {node.path || '—'}
                            </span>
                          </TableCell>
                          <TableCell>{node.sort}</TableCell>
                          <TableCell>
                            <Switch
                              checked={node.status === 1}
                              aria-label={`${i18n.resolvedLanguage?.startsWith('zh') || i18n.language.startsWith('zh') ? node.nameZh : node.nameEn} ${t('menu:system.status')}`}
                              disabled={pendingActionId !== null}
                              onCheckedChange={() => updateStatus(node)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setFormState({ node, parentId: '' })}
                              >
                                {t('menu:system.editMenu')}
                              </Button>
                              {node.type === 'directory' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setFormState({ parentId: node.id })}
                                >
                                  {t('menu:system.addChild')}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={pendingActionId !== null}
                                onClick={() => setDeleteTarget(node)}
                              >
                                {t('menu:system.delete')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={open => !open && pendingActionId === null && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('menu:system.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('menu:system.confirmDeleteDescription', {
                name: deleteTarget
                  ? (i18n.resolvedLanguage?.startsWith('zh') || i18n.language.startsWith('zh')
                      ? deleteTarget.nameZh
                      : deleteTarget.nameEn)
                  : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingActionId !== null}>
              {t('menu:system.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pendingActionId !== null}
              onClick={(event) => {
                event.preventDefault()
                void deleteMenu()
              }}
            >
              {pendingActionId !== null ? <Spinner data-icon="inline-start" /> : null}
              {t('menu:system.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {formState && (
        <MenuFormDialog
          key={formState.node?.id ?? `new-${formState.parentId}`}
          node={formState.node}
          initialParentId={formState.parentId}
          nodes={nodes}
          onOpenChange={open => !open && setFormState(null)}
          onSaved={refetch}
        />
      )}
    </Card>
  )
}
