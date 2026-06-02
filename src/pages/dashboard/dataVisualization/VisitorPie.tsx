import type { ChartConfig } from '@/components/ui/chart'
import * as React from 'react'

import { useTranslation } from 'react-i18next'
import { Label, Pie, PieChart } from 'recharts'
import {

  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export const description = 'A donut chart with text'

// const chartData = [
//   { source: 'gitee', visitors: 233, fill: 'color-mix(in oklch, var(--color-primary) 100%, transparent)' },
//   { source: 'github', visitors: 334, fill: 'color-mix(in oklch, var(--color-primary) 85%, transparent)' },
//   { source: 'today', visitors: 123, fill: 'color-mix(in oklch, var(--color-primary) 70%, transparent)' },
//   { source: 'yesterday', visitors: 173, fill: 'color-mix(in oklch, var(--color-primary) 55%, transparent)' },
// ]

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  gitee: {
    label: 'gitee访问数',

  },
  github: {
    label: 'github访问数',
  },
  today: {
    label: 'today访问数',
  },
  yesterday: {
    label: 'yesterday访问数',
  },

} satisfies ChartConfig

interface ChartDataType {
  source: string
  visitors: number
  fill: string
}

interface VisitorPieProps {
  chartData: Array<ChartDataType>
}

export default function ChartPieDonutText({ chartData }: VisitorPieProps) {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [chartData])
  const { t } = useTranslation()

  return (

    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-64"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="visitors"
          nameKey="source"
          innerRadius="60%"
          outerRadius="80%"
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
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalVisitors.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      {t('menu:dashboard.visitors')}
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>

      </PieChart>
    </ChartContainer>

  )
}
