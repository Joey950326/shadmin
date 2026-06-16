import type { LegendPayload } from 'recharts'
import type { ChartData, HoverOpacity, MonthData, SeriesKey } from './types'
import type { ChartConfig } from '@/components/ui/chart'
import { TrendingUp } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, XAxis } from 'recharts'
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

export const description = 'A stacked bar chart with a legend'
const PHONE_MODEL = ['iphone15', 'iphone16', 'iphone17'] as const
const PHONE_TYPE = ['base', 'plus', 'max'] as const
const DEMO_DATA = [
  {
    month: 'January',
    iphone15: { base: 186, plus: 80, max: 125 },
    iphone16: { base: 245, plus: 110, max: 168 },
    iphone17: { base: 278, plus: 125, max: 195 },

  },
  {
    month: 'February',
    iphone15: { base: 305, plus: 200, max: 135 },
    iphone16: { base: 368, plus: 245, max: 172 },
    iphone17: { base: 410, plus: 265, max: 198 },
  },
  {
    month: 'March',
    iphone15: { base: 237, plus: 120, max: 145 },
    iphone16: { base: 289, plus: 155, max: 188 },
    iphone17: { base: 325, plus: 178, max: 215 },
  },
  {
    month: 'April',
    iphone15: { base: 73, plus: 190, max: 151 },
    iphone16: { base: 95, plus: 235, max: 192 },
    iphone17: { base: 112, plus: 258, max: 220 },
  },
  {
    month: 'May',
    iphone15: { base: 209, plus: 130, max: 34 },
    iphone16: { base: 255, plus: 168, max: 68 },
    iphone17: { base: 289, plus: 195, max: 92 },
  },
  {
    month: 'June',
    iphone15: { base: 214, plus: 140, max: 115 },
    iphone16: { base: 268, plus: 175, max: 148 },
    iphone17: { base: 305, plus: 198, max: 172 },
  },
]

function transformChartData(data: ChartData) {
  return data.map((item: MonthData) => {
    const base: Record<string, any> = { month: item.month }

    // iPhone 15
    base['iphone15-base'] = item.iphone15.base
    base['iphone15-plus'] = item.iphone15.plus
    base['iphone15-max'] = item.iphone15.max

    // iPhone 16
    base['iphone16-base'] = item.iphone16.base
    base['iphone16-plus'] = item.iphone16.plus
    base['iphone16-max'] = item.iphone16.max

    // iPhone 17
    base['iphone17-base'] = item.iphone17.base
    base['iphone17-plus'] = item.iphone17.plus
    base['iphone17-max'] = item.iphone17.max

    return base
  })
}

const chartConfig = {
  'iphone15-base': {
    label: 'iPhone 15',
    color: 'var(--chart-2)', // Tailwind blue-500
  },
  'iphone15-plus': {
    label: 'iPhone 15 Plus',
    color: 'var(--chart-3)',
  },
  'iphone15-max': {
    label: 'iPhone 15 Pro Max',
    color: 'var(--chart-4)',
  },

  'iphone16-base': {
    label: 'iPhone 16',
    color: 'var(--chart-2)', // green-500
  },
  'iphone16-plus': {
    label: 'iPhone 16 Plus',
    color: 'var(--chart-3)',
  },
  'iphone16-max': {
    label: 'iPhone 16 Pro Max',
    color: 'var(--chart-4)',
  },

  'iphone17-base': {
    label: 'iPhone 17',
    color: 'var(--chart-2)', // violet-500
  },
  'iphone17-plus': {
    label: 'iPhone 17 Plus',
    color: 'var(--chart-3)',
  },
  'iphone17-max': {
    label: 'iPhone 17 Pro Max',
    color: 'var(--chart-4)',
  },
} as ChartConfig

export default function BarChartCmp() {
  const chartData = transformChartData(DEMO_DATA)
  const [hoverOpacity, setHoverOpacity] = useState<HoverOpacity>({})
  const handleLegendMouseEnter = useCallback((payload: LegendPayload) => {
    const datakey = payload.dataKey as SeriesKey
    setHoverOpacity(prev => ({ ...prev, ...{ [datakey]: 0.5 } }))
  }, [setHoverOpacity])
  const handleLegendMouseLeave = useCallback((payload: LegendPayload) => {
    const datakey = payload.dataKey as SeriesKey
    setHoverOpacity(prev => ({ ...prev, ...{ [datakey]: 1 } }))
  }, [setHoverOpacity])
  return (
    <Card className="size-full">
      <CardHeader>
        <CardTitle>柱状图</CardTitle>
        <CardDescription>简单柱状图示例</CardDescription>
      </CardHeader>
      {/* 这里必须加上overflow-hidden 否则图表无法响应式 */}
      <CardContent className="overflow-hidden">
        <ChartContainer config={chartConfig} className="size-full min-h-[300px]">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={true}
              tickFormatter={value => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {/* <ChartLegend content={<ChartLegendContent className="overflow-x-auto" />} /> */}
            <Legend
              align="left"
              onMouseEnter={payload => handleLegendMouseEnter(payload)}
              onMouseLeave={payload => handleLegendMouseLeave(payload)}
            >
            </Legend>
            {
              PHONE_MODEL.map(model => (
                PHONE_TYPE.map(type => (
                  <Bar
                    // fillOpacity={(hoverOpacity[`${model}-${type}`] ?? 1)}
                    key={`${model}-${type}`}
                    dataKey={`${model}-${type}`}
                    stackId={model}
                    fill={`var(--color-${model}-${type})`}
                    style={hoverOpacity[`${model}-${type}`] === 0.5 ? { fill: 'var(--primary)' } : {}}
                  />
                ))
              ))
            }

          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm min-h-16 shrink-0">
        <div className="flex gap-2 leading-none font-medium">
          店铺手机型号销售数据
          {' '}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          店铺近半年手机各型号销量统计
        </div>
      </CardFooter>
    </Card>
  )
}
