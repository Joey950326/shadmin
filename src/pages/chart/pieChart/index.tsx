import type { PieSectorShapeProps } from 'recharts'
import type { ChartData, TotalSales } from './types'

import type { ChartConfig } from '@/components/ui/chart'
import { TrendingUpIcon } from 'lucide-react'
import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Label, Legend, Pie, PieChart, Sector } from 'recharts'
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

function transformChartData(data: ChartData) {
  const initial: TotalSales = {
    iphone15: [
      { type: 'base', value: 0, fill: 'var(--color-iphone15-base)' },
      { type: 'plus', value: 0, fill: 'var(--color-iphone15-plus)' },
      { type: 'max', value: 0, fill: 'var(--color-iphone15-max)' },
    ],
    iphone16: [
      { type: 'base', value: 0, fill: 'var(--color-iphone16-base)' },
      { type: 'plus', value: 0, fill: 'var(--color-iphone16-plus)' },
      { type: 'max', value: 0, fill: 'var(--color-iphone16-max)' },
    ],
    iphone17: [
      { type: 'base', value: 0, fill: 'var(--color-iphone17-base)' },
      { type: 'plus', value: 0, fill: 'var(--color-iphone17-plus)' },
      { type: 'max', value: 0, fill: 'var(--color-iphone17-max)' },
    ],
  }

  return data.reduce((acc, month) => {
    // iPhone 15
    acc.iphone15[0].value += month.iphone15.base
    acc.iphone15[1].value += month.iphone15.plus
    acc.iphone15[2].value += month.iphone15.max

    // iPhone 16
    acc.iphone16[0].value += month.iphone16.base
    acc.iphone16[1].value += month.iphone16.plus
    acc.iphone16[2].value += month.iphone16.max

    // iPhone 17
    acc.iphone17[0].value += month.iphone17.base
    acc.iphone17[1].value += month.iphone17.plus
    acc.iphone17[2].value += month.iphone17.max

    return acc
  }, initial)
}

function PieChartCmp() {
  const { t } = useTranslation()
  const chartData = useMemo(() => transformChartData(DEMO_DATA), [])
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
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

  return (
    <Card className="size-full py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>{t('chart.pieTitle')}</CardTitle>
          <CardDescription>
            {t('chart.simplePieChart')}
          </CardDescription>
        </div>
        <div className="flex">
          {PHONE_MODEL_VALUE.map((model) => {
            return (
              <button
                key={model}
                data-active={activeChart === model}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-primary/20 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
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
          <PieChart>

            {/* hover提示 */}
            <ChartTooltip

              content={(
                <ChartTooltipContent
                  formatter={(val, name) => `${activeChart}${name}: ${val}`}
                />
              )}
            />
            {/* 图标指示 */}
            <Legend
              align="center"
              wrapperStyle={{ paddingTop: '0.5rem', cursor: 'pointer' }}
              onMouseEnter={payload => setCurrentIndex(PHONE_TYPE_VALUE.findIndex(val => val === payload.value))}
              onMouseLeave={() => setCurrentIndex(-1)}
              formatter={(val, _, index) => `${activeChart}${val}:${chartData[activeChart][index].value}`}
            >
            </Legend>

            {/* 扇形 */}
            <Pie
              key={`${activeChart}`}
              data={chartData[activeChart]}
              nameKey="type"
              dataKey="value"
              onMouseEnter={(_, index) => setCurrentIndex(index)}
              onMouseLeave={() => setCurrentIndex(-1)}
              innerRadius={60}
              strokeWidth={5}
              className="transition-all duration-500 ease-in cursor-pointer "
              shape={({
                index,
                outerRadius = 0,
                ...props
              }: PieSectorShapeProps) =>
                index === currentIndex
                  ? (
                      <Sector {...props} outerRadius={outerRadius + 10} />
                    )
                  : (
                      <Sector {...props} outerRadius={outerRadius} />
                    )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy - 5}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {total[activeChart].toLocaleString()}
                        </tspan>

                      </text>
                    )
                  }
                }}
              />

            </Pie>

          </PieChart>
        </ChartContainer>

      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm min-h-16 shrink-0">
        <div className="flex gap-2 leading-none font-medium">
          {t('chart.salesByPhoneModel')}
          {' '}
          <TrendingUpIcon className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {t('chart.phoneSalesSummary')}
        </div>
      </CardFooter>
    </Card>
  )
}

export default memo(PieChartCmp)
