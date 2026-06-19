import type { LegendPayload } from 'recharts'
import type { SeriesKey } from './types'

import type { ChartConfig } from '@/components/ui/chart'
import { TrendingUpIcon } from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts'
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

const PHONE_MODEL_VALUE = ['iphone15', 'iphone16', 'iphone17'] as const
type PHONE_MODE = typeof PHONE_MODEL_VALUE[number]
const PHONE_TYPE_VALUE = ['base', 'plus', 'max'] as const
type PHOEN_TYPE = typeof PHONE_TYPE_VALUE[number]
type HoverOpacity = Partial<Record<PHOEN_TYPE, number>>
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

const chartConfig = {
  'iphone15-base': {
    label: 'iPhone 15',
    color: 'violet',
  },
  'iphone15-plus': {
    label: 'iPhone 15 Plus',
    color: 'lime',
  },
  'iphone15-max': {
    label: 'iPhone 15 Pro Max',
    color: 'teal',
  },

  'iphone16-base': {
    label: 'iPhone 16',
    color: 'purple',
  },
  'iphone16-plus': {
    label: 'iPhone 16 Plus',
    color: 'tomato',
  },
  'iphone16-max': {
    label: 'iPhone 16 Pro Max',
    color: 'cyan',
  },

  'iphone17-base': {
    label: 'iPhone 17',
    color: 'magenta', // violet-500
  },
  'iphone17-plus': {
    label: 'iPhone 17 Plus',
    color: 'orange',
  },
  'iphone17-max': {
    label: 'iPhone 17 Pro Max',
    color: 'chocolate',
  },
} as ChartConfig

function LineChartCmp() {
  const chartData = useMemo(() => DEMO_DATA, [])
  const [hoverOpacity, setHoverOpacity] = useState<HoverOpacity>({})
  const [activeChart, setActiveChart]
    = useState<PHONE_MODE>('iphone15')

  const total = useMemo(
    () => ({
      iphone15: DEMO_DATA.reduce((acc, curr) => acc + PHONE_TYPE_VALUE.reduce((acc, type) => acc + curr.iphone15[type], 0), 0),
      iphone16: DEMO_DATA.reduce((acc, curr) => acc + PHONE_TYPE_VALUE.reduce((acc, type) => acc + curr.iphone16[type], 0), 0),
      iphone17: DEMO_DATA.reduce((acc, curr) => acc + PHONE_TYPE_VALUE.reduce((acc, type) => acc + curr.iphone17[type], 0), 0),

    }),
    [],
  )

  const handleLegendMouseEnter = useCallback((payload: LegendPayload) => {
    const datakey = (payload.dataKey as SeriesKey).split('.')[1]
    setHoverOpacity(prev => ({ ...prev, ...{ [datakey]: 0.3 } }))
  }, [setHoverOpacity])
  const handleLegendMouseLeave = useCallback((payload: LegendPayload) => {
    const datakey = (payload.dataKey as SeriesKey).split('.')[1]
    setHoverOpacity(prev => ({ ...prev, ...{ [datakey]: 1 } }))
  }, [setHoverOpacity])

  return (
    <Card className="size-full py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>折线图</CardTitle>
          <CardDescription>
            简单折线图示例
          </CardDescription>
        </div>
        <div className="flex">
          {PHONE_MODEL_VALUE.map((model) => {
            return (
              <button
                key={model}
                data-active={activeChart === model}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(model)}
              >
                <span className="text-xs text-muted-foreground">
                  {model}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[model].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden px-2 md:px-4">
        <ChartContainer
          config={chartConfig}
          className="size-full min-h-[300px]"
        >
          <LineChart
            accessibilityLayer
            data={chartData}

          >
            <CartesianGrid />
            {/* 横坐标 */}
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={value => value.slice(0, 3)}
            />
            {/* 纵坐标 */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            {/* hover提示 */}
            <ChartTooltip
              content={(
                <ChartTooltipContent
                  nameKey="views"
                  formatter={(val, name) => `${name?.toString().split('.').join('')}: ${val}`}
                />
              )}
            />
            {/* 图标指示 */}
            <Legend
              align="center"
              wrapperStyle={{ paddingTop: '0.5rem', cursor: 'pointer' }}
              onMouseEnter={payload => handleLegendMouseEnter(payload)}
              onMouseLeave={payload => handleLegendMouseLeave(payload)}
            >
            </Legend>

            {/* 折线 */}
            {
              PHONE_TYPE_VALUE.map(type => (
                <Line
                  key={type}
                  dataKey={`${activeChart}.${type}`}
                  type="natural"
                  stroke={`var(--color-${activeChart}-${type})`}
                  strokeWidth={2}
                  strokeOpacity={(hoverOpacity[type] ?? 1)}
                  dot={false}

                />
              ))
            }

          </LineChart>
        </ChartContainer>

      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm min-h-16 shrink-0">
        <div className="flex gap-2 leading-none font-medium">
          店铺手机型号销售数据
          {' '}
          <TrendingUpIcon className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          店铺近半年手机各型号销量统计
        </div>
      </CardFooter>
    </Card>
  )
}

export default memo(LineChartCmp)
