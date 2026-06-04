import { CalendarCheckIcon, CalendarIcon, GitGraphIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import GithubIcon from './GithubIcon'
import VisitorBar from './VisitorBar'
import VisitorPie from './VisitorPie'

export default function DataVisualization() {
  const { t } = useTranslation()
  const pieData = useMemo(() => [
    { source: 'gitee', visitors: 233, fill: 'var(--chart-1)' },
    { source: 'github', visitors: 334, fill: 'var(--chart-2)' },
    { source: 'today', visitors: 123, fill: 'var(--chart-3)' },
    { source: 'yesterday', visitors: 173, fill: 'var(--chart-4)' },
  ], [])
  const barData = useMemo(() => [
    { date: '2024-04-01', gitee: 222, github: 97, today: 167, yesterday: 242 },
    { date: '2024-04-02', gitee: 373, github: 301, today: 245, yesterday: 409 },
    { date: '2024-04-03', gitee: 59, github: 261, today: 327, yesterday: 292 },
    { date: '2024-04-04', gitee: 137, github: 120, today: 138, yesterday: 448 },
    { date: '2024-04-05', gitee: 227, github: 293, today: 335, yesterday: 197 },
    { date: '2024-04-08', gitee: 409, github: 320, today: 371, yesterday: 475 },
    { date: '2024-04-09', gitee: 59, github: 110, today: 107, yesterday: 341 },
    { date: '2024-04-10', gitee: 261, github: 190, today: 169, yesterday: 317 },
    { date: '2024-04-11', gitee: 327, github: 350, today: 317, yesterday: 480 },
    { date: '2024-04-12', gitee: 292, github: 210, today: 245, yesterday: 409 },
    { date: '2024-04-13', gitee: 342, github: 380, today: 293, yesterday: 420 },
    { date: '2024-04-14', gitee: 137, github: 220, today: 138, yesterday: 448 },
    { date: '2024-04-15', gitee: 120, github: 170, today: 120, yesterday: 390 },
    { date: '2024-04-16', gitee: 138, github: 190, today: 138, yesterday: 490 },
    { date: '2024-04-17', gitee: 446, github: 360, today: 446, yesterday: 550 },
    { date: '2024-04-18', gitee: 364, github: 410, today: 364, yesterday: 570 },
    { date: '2024-04-19', gitee: 243, github: 180, today: 243, yesterday: 280 },
    { date: '2024-04-20', gitee: 89, github: 150, today: 89, yesterday: 200 },
    { date: '2024-04-21', gitee: 137, github: 200, today: 137, yesterday: 250 },
    { date: '2024-04-22', gitee: 224, github: 170, today: 224, yesterday: 300 },
    { date: '2024-04-23', gitee: 138, github: 230, today: 138, yesterday: 320 },
    { date: '2024-04-24', gitee: 387, github: 290, today: 387, yesterday: 450 },
    { date: '2024-04-25', gitee: 215, github: 250, today: 215, yesterday: 350 },
    { date: '2024-04-26', gitee: 75, github: 130, today: 75, yesterday: 180 },
    { date: '2024-04-27', gitee: 383, github: 420, today: 383, yesterday: 480 },
    { date: '2024-04-28', gitee: 122, github: 180, today: 122, yesterday: 240 },
    { date: '2024-04-29', gitee: 315, github: 240, today: 315, yesterday: 380 },
    { date: '2024-04-30', gitee: 454, github: 380, today: 454, yesterday: 520 },
    { date: '2024-05-01', gitee: 165, github: 220, today: 165, yesterday: 290 },
    { date: '2024-05-02', gitee: 293, github: 310, today: 293, yesterday: 420 },
    { date: '2024-05-03', gitee: 247, github: 190, today: 247, yesterday: 340 },
    { date: '2024-05-04', gitee: 385, github: 420, today: 385, yesterday: 500 },
    { date: '2024-05-05', gitee: 481, github: 390, today: 481, yesterday: 560 },
    { date: '2024-05-06', gitee: 498, github: 520, today: 498, yesterday: 600 },
    { date: '2024-05-07', gitee: 388, github: 300, today: 388, yesterday: 450 },
    { date: '2024-05-08', gitee: 149, github: 210, today: 149, yesterday: 280 },
    { date: '2024-05-09', gitee: 227, github: 180, today: 227, yesterday: 310 },
    { date: '2024-05-10', gitee: 293, github: 330, today: 293, yesterday: 400 },
    { date: '2024-05-11', gitee: 335, github: 270, today: 335, yesterday: 420 },
    { date: '2024-05-12', gitee: 197, github: 240, today: 197, yesterday: 300 },
    { date: '2024-05-13', gitee: 197, github: 160, today: 197, yesterday: 280 },
    { date: '2024-05-14', gitee: 448, github: 490, today: 448, yesterday: 580 },
    { date: '2024-05-15', gitee: 473, github: 380, today: 473, yesterday: 520 },
    { date: '2024-05-16', gitee: 338, github: 400, today: 338, yesterday: 450 },
    { date: '2024-05-17', gitee: 499, github: 420, today: 499, yesterday: 560 },
    { date: '2024-05-18', gitee: 315, github: 350, today: 315, yesterday: 400 },
    { date: '2024-05-19', gitee: 235, github: 180, today: 235, yesterday: 320 },
    { date: '2024-05-20', gitee: 177, github: 230, today: 177, yesterday: 300 },
    { date: '2024-05-21', gitee: 82, github: 140, today: 82, yesterday: 200 },
    { date: '2024-05-22', gitee: 81, github: 120, today: 81, yesterday: 180 },
    { date: '2024-05-23', gitee: 252, github: 290, today: 252, yesterday: 380 },
    { date: '2024-05-24', gitee: 294, github: 220, today: 294, yesterday: 350 },
    { date: '2024-05-25', gitee: 201, github: 250, today: 201, yesterday: 320 },
    { date: '2024-05-26', gitee: 213, github: 170, today: 213, yesterday: 280 },
    { date: '2024-05-27', gitee: 420, github: 460, today: 420, yesterday: 520 },
    { date: '2024-05-28', gitee: 233, github: 190, today: 233, yesterday: 310 },
    { date: '2024-05-29', gitee: 78, github: 130, today: 78, yesterday: 180 },
    { date: '2024-05-30', gitee: 340, github: 280, today: 340, yesterday: 420 },
    { date: '2024-05-31', gitee: 178, github: 230, today: 178, yesterday: 300 },
    { date: '2024-06-01', gitee: 178, github: 200, today: 178, yesterday: 280 },
    { date: '2024-06-02', gitee: 470, github: 410, today: 470, yesterday: 540 },
    { date: '2024-06-03', gitee: 103, github: 160, today: 103, yesterday: 220 },
    { date: '2024-06-04', gitee: 439, github: 380, today: 439, yesterday: 500 },
    { date: '2024-06-05', gitee: 88, github: 140, today: 88, yesterday: 200 },
    { date: '2024-06-06', gitee: 294, github: 250, today: 294, yesterday: 360 },
    { date: '2024-06-07', gitee: 323, github: 370, today: 323, yesterday: 430 },
    { date: '2024-06-08', gitee: 385, github: 320, today: 385, yesterday: 460 },
    { date: '2024-06-09', gitee: 438, github: 480, today: 438, yesterday: 560 },
    { date: '2024-06-10', gitee: 155, github: 200, today: 155, yesterday: 280 },
    { date: '2024-06-11', gitee: 92, github: 150, today: 92, yesterday: 220 },
    { date: '2024-06-12', gitee: 492, github: 420, today: 492, yesterday: 580 },
    { date: '2024-06-13', gitee: 81, github: 130, today: 81, yesterday: 200 },
    { date: '2024-06-14', gitee: 426, github: 380, today: 426, yesterday: 500 },
    { date: '2024-06-15', gitee: 307, github: 350, today: 307, yesterday: 420 },
    { date: '2024-06-16', gitee: 371, github: 310, today: 371, yesterday: 450 },
    { date: '2024-06-17', gitee: 475, github: 520, today: 475, yesterday: 580 },
    { date: '2024-06-18', gitee: 107, github: 170, today: 107, yesterday: 240 },
    { date: '2024-06-19', gitee: 341, github: 290, today: 341, yesterday: 420 },
    { date: '2024-06-20', gitee: 408, github: 450, today: 408, yesterday: 520 },
    { date: '2024-06-21', gitee: 169, github: 210, today: 169, yesterday: 290 },
    { date: '2024-06-22', gitee: 317, github: 270, today: 317, yesterday: 400 },
    { date: '2024-06-23', gitee: 480, github: 530, today: 480, yesterday: 600 },
    { date: '2024-06-24', gitee: 132, github: 180, today: 132, yesterday: 250 },
    { date: '2024-06-25', gitee: 141, github: 190, today: 141, yesterday: 270 },
    { date: '2024-06-26', gitee: 434, github: 380, today: 434, yesterday: 500 },
    { date: '2024-06-27', gitee: 448, github: 490, today: 448, yesterday: 560 },
    { date: '2024-06-28', gitee: 149, github: 200, today: 149, yesterday: 280 },
    { date: '2024-06-29', gitee: 103, github: 160, today: 103, yesterday: 220 },
    { date: '2024-06-30', gitee: 446, github: 400, today: 446, yesterday: 520 },
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
        <div className="col-span-1 grid grid-cols-2 gap-4">
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
        <Card className="col-span-1 bg-linear-to-br from-background via-blue-500/15 to-blue-500/50">
          <CardHeader className="box-border border-b">
            <CardTitle>{t('menu:dashboard.visitorReport')}</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitorPie chartData={pieData} />
          </CardContent>
          <CardFooter className="box-border">
            <span className="text-xs text-muted-foreground">{t('menu:dashboard.visitorSourceDescription', { source: 'shadmin' })}</span>
          </CardFooter>
        </Card>
        <VisitorBar className="col-span-1 md:col-span-2 size-full bg-linear-to-br from-card via-green-400/10 to-green-500/20" chartData={barData} />
      </CardContent>
    </Card>

  )
}
