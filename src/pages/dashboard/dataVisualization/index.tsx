import { CalendarCheckIcon, CalendarIcon, GitGraphIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import GithubIcon from './GithubIcon'
import VisitorPie from './VisitorPie'

export default function DataVisualization() {
  const { t } = useTranslation()
  const chartData = useMemo(() => [
    { source: 'gitee', visitors: 233, fill: 'color-mix(in oklch, var(--color-primary) 100%, transparent)' },
    { source: 'github', visitors: 334, fill: 'color-mix(in oklch, var(--color-primary) 80%, transparent)' },
    { source: 'today', visitors: 123, fill: 'color-mix(in oklch, var(--color-primary) 60%, transparent)' },
    { source: 'yesterday', visitors: 173, fill: 'color-mix(in oklch, var(--color-primary) 40%, transparent)' },
  ], [])
  return (
    <Card>
      <CardHeader>
        <CardTitle className="py-2 border-b">{t('menu:dashboard.dataVisualization')}</CardTitle>
      </CardHeader>
      <CardContent className=" grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 ">
        {/* <Card className="size-full bg-linear-to-br from-background via-green-500/15 to-green-500/30">
          <CardHeader className="box-border border-b">
            <CardTitle>访问总数 </CardTitle>
          </CardHeader>
          <CardContent className="flex size-full flex-col items-center justify-center gap-2">
            <EyeIcon size={48} />
            <span className="font-bold text-lg">1234</span>
          </CardContent>
        </Card> */}
        <div className=" col-span-1 grid grid-cols-2 gap-4">
          <Card size="sm" className="w-full min-h-46 bg-linear-to-br from-background via-foreground/5 to-foreground/10">
            <CardHeader className="box-border border-b">
              <CardTitle className="text-xs">{t('menu:dashboard.giteeVisitors')}</CardTitle>
            </CardHeader>
            <CardContent className="flex size-full flex-col items-center justify-center gap-2">
              <div className="p-2 bg-background rounded-lg">
                <GitGraphIcon size={36} />
              </div>
              <span className="font-bold">223</span>
            </CardContent>
          </Card>
          <Card size="sm" className="w-full min-h-46 bg-linear-to-br from-background via-orange-500/15 to-orange-500/30">
            <CardHeader className="box-border border-b">
              <CardTitle className="text-xs">{t('menu:dashboard.githubVisitors')}</CardTitle>
            </CardHeader>
            <CardContent className="flex size-full flex-col items-center justify-center gap-2">
              <div className="p-2 bg-background rounded-lg">
                <GithubIcon size={36} />
              </div>
              <span className="font-bold">334</span>
            </CardContent>
          </Card>
          <Card size="sm" className="w-full min-h-46 bg-linear-to-br from-background via-purple-500/15 to-purple-500/30">
            <CardHeader className="box-border border-b">
              <CardTitle className="text-xs">{t('menu:dashboard.todayVisitors')}</CardTitle>
            </CardHeader>
            <CardContent className="flex size-full flex-col items-center justify-center gap-2">
              <div className="p-2 bg-background rounded-lg">
                <CalendarIcon size={36} />
              </div>
              <span className="font-bold">214</span>
            </CardContent>
          </Card>
          <Card size="sm" className="w-full min-h-46 bg-linear-to-br from-background via-yellow-500/15 to-yellow-500/50">
            <CardHeader className="box-border border-b">
              <CardTitle className="text-xs">{t('menu:dashboard.yesterdayVisitors')}</CardTitle>
            </CardHeader>
            <CardContent className="flex size-full flex-col items-center justify-center gap-2">
              <div className="p-2 bg-background rounded-lg">
                <CalendarCheckIcon size={36} />
              </div>
              <span className="font-bold">144</span>
            </CardContent>
          </Card>
        </div>
        <Card className=" col-span-1 bg-linear-to-br from-background via-foreground/5 to-foreground/20">
          <CardHeader className="box-border border-b">
            <CardTitle>{t('menu:dashboard.visitorReport')}</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitorPie chartData={chartData} />
          </CardContent>
          <CardFooter className="box-border">
            <span className="text-xs text-muted-foreground">{t('menu:dashboard.visitorSourceDescription', { source: 'shadmin' })}</span>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  )
}
