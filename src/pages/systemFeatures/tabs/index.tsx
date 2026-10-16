import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useRouteTabActions } from '@/features/routeTabs'
import useMenu from '@/hooks/useMenu'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  closeAllRouteTabs,
  selectTabsData,
  updateTabsData,
} from '@/store/modules/tabs'

const permissionSwitchPath = '/systemFeatures/permissionSwitch'
const homePath = '/home/index'

export default function RouteTabsDemoPage() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const tabsData = useAppSelector(selectTabsData)
  const currentTab = tabsData.find(tab => tab.path === location.pathname)
  const permissionSwitchTab = tabsData.find(
    tab => tab.path === permissionSwitchPath,
  )
  const { currentMenu } = useMenu()
  const { closeTab, setCustomTitle, resetCustomTitle } = useRouteTabActions()
  const [titleDraft, setTitleDraft] = useState(currentTab?.customTitle ?? '')
  const title
    = currentTab?.customTitle ?? currentMenu?.meta?.title ?? location.pathname
  const trimmedTitle = titleDraft.trim()

  return (
    <main className="h-full min-h-0 overflow-hidden">
      <Card className="h-full min-h-0">
        <ScrollArea className="min-h-0 flex-1">
          <CardHeader>
            <CardTitle
              role="heading"
              aria-level={1}
              className="text-2xl font-semibold"
            >
              {t('routeTabsDemo.title')}
            </CardTitle>
            <CardDescription>{t('routeTabsDemo.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <section
              aria-labelledby="route-tab-actions"
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <h2 id="route-tab-actions" className="text-lg font-medium">
                  {t('routeTabsDemo.routeActionsTitle')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('routeTabsDemo.routeActionsDescription')}
                </p>
              </div>
              <section
                aria-labelledby="route-tab-navigation"
                className="flex flex-col gap-3"
              >
                <h3 id="route-tab-navigation" className="text-sm font-medium">
                  {t('routeTabsDemo.openPagesSection')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => navigate(homePath)}>
                    {t('routeTabsDemo.openHome')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(permissionSwitchPath)}
                  >
                    {t('routeTabsDemo.openPermissionSwitch')}
                  </Button>
                </div>
              </section>
              <Separator />
              <section
                aria-labelledby="route-tab-close"
                className="flex flex-col gap-3"
              >
                <h3 id="route-tab-close" className="text-sm font-medium">
                  {t('routeTabsDemo.closeCurrent')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={!currentTab || location.pathname === homePath}
                    onClick={() => closeTab(location.pathname)}
                  >
                    {t('routeTabsDemo.closeCurrent')}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!currentTab}
                    onClick={() => {
                      dispatch(updateTabsData(tabsData.filter(tab => (
                        tab.path === location.pathname || tab.path === homePath
                      ))))
                    }}
                  >
                    {t('routeTabsDemo.closeOtherTabs')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      dispatch(closeAllRouteTabs(location.pathname))
                      navigate(homePath)
                    }}
                  >
                    {t('routeTabsDemo.closeAllTabs')}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!permissionSwitchTab}
                    onClick={() => closeTab(permissionSwitchPath)}
                  >
                    {t('routeTabsDemo.closePermissionSwitch')}
                  </Button>
                </div>
                {location.pathname === homePath && (
                  <p className="text-sm text-muted-foreground">
                    {t('routeTabsDemo.homeCannotClose')}
                  </p>
                )}
                {!currentTab && (
                  <p className="text-sm text-muted-foreground">
                    {t('routeTabsDemo.noCurrentTab')}
                  </p>
                )}
              </section>
            </section>
            <Separator />
            <section
              aria-labelledby="route-tab-title-actions"
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <h2 id="route-tab-title-actions" className="text-lg font-medium">
                  {t('routeTabsDemo.titleActionsTitle')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('routeTabsDemo.titleActionsDescription')}
                </p>
              </div>
              <section
                aria-labelledby="route-tab-title-edit"
                className="flex flex-col gap-3"
              >
                <h3 id="route-tab-title-edit" className="text-sm font-medium">
                  {t('routeTabsDemo.editTitleSection')}
                </h3>
                <label htmlFor="route-tab-title" className="text-sm font-medium">
                  {t('routeTabsDemo.titleLabel')}
                </label>
                <Input
                  id="route-tab-title"
                  className="max-w-md"
                  value={titleDraft}
                  placeholder={t('routeTabsDemo.titlePlaceholder')}
                  disabled={!currentTab}
                  onChange={event => setTitleDraft(event.target.value)}
                />
                <p className="text-sm text-muted-foreground">{title}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={!currentTab || !trimmedTitle}
                    onClick={() => {
                      setCustomTitle(location.pathname, trimmedTitle)
                      setTitleDraft(trimmedTitle)
                    }}
                  >
                    {t('routeTabsDemo.applyTitle')}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!currentTab?.customTitle}
                    onClick={() => {
                      resetCustomTitle(location.pathname)
                      setTitleDraft('')
                    }}
                  >
                    {t('routeTabsDemo.resetTitle')}
                  </Button>
                </div>
              </section>
            </section>
          </CardContent>
        </ScrollArea>
      </Card>
    </main>
  )
}
