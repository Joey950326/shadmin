import type { ChartConfig } from '@/components/ui/chart'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {

  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

export const description = 'An interactive bar chart'

export interface ChartDataType {
  date: string
  gitee: number
  github: number
  today: number
  yesterday: number
}

const sourceArray = ['gitee', 'github', 'today', 'yesterday'] as const

interface VisitorBarProps {
  chartData: Array<ChartDataType>
  className?: string
}

const languageMap: Record<string, string> = {
  zh: 'zh-CN',
  en: 'en-US',
}

export default function VisitorBar({ chartData, className }: VisitorBarProps) {
  const { t, i18n } = useTranslation()

  const [activeChart, setActiveChart]
    = useState<keyof typeof chartConfig>('gitee')

  const chartConfig = useMemo(() => ({
    views: {
      label: 'Page Views',
    },
    gitee: {
      label: t('menu:dashboard.giteeVisitors'),
      color: 'var(--chart-1)',
    },
    github: {
      label: t('menu:dashboard.githubVisitors'),
      color: 'var(--chart-2)',
    },
    today: {
      label: t('menu:dashboard.todayVisitors'),
      color: 'var(--chart-3)',
    },
    yesterday: {
      label: t('menu:dashboard.yesterdayVisitors'),
      color: 'var(--chart-4)',
    },
  }) satisfies ChartConfig, [t])

  const total = useMemo(
    () => ({
      gitee: chartData.reduce((acc, curr) => acc + curr.gitee, 0),
      github: chartData.reduce((acc, curr) => acc + curr.github, 0),
      today: chartData.reduce((acc, curr) => acc + curr.today, 0),
      yesterday: chartData.reduce((acc, curr) => acc + curr.yesterday, 0),
    }),
    [chartData],
  )

  return (
    <Card className={cn('size-full', className)}>
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 sm:py-0!">
          <CardTitle>{t('menu:dashboard.visitorTrend')}</CardTitle>
          <CardDescription>
            {t('menu:dashboard.visitorBarDescription')}
          </CardDescription>
        </div>
        <div className="grid grid-cols-4 gap-2 p-2 md:p-4">
          {sourceArray.map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <Button
                variant="ghost"
                key={chart}
                data-active={activeChart === chart}
                className={cn(
                  'relative col-span-2 md:col-span-1 z-30 flex flex-col justify-center gap-1 py-6 md:px-4  not-first:-ml-1.5',
                  'hover:bg-primary/10!',
                  'data-[active=true]:bg-primary/20',

                )}
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </Button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full "
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(languageMap[i18n.language] || 'en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              content={(
                <ChartTooltipContent
                  className="w-40"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString(languageMap[i18n.language] || 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }}
                />
              )}
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="box-border">
        <span className="text-xs text-muted-foreground">虚构数据，仅供展示</span>
      </CardFooter>
    </Card>
  )
}
