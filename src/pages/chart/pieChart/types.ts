export interface ModelSales {
  base: number
  plus: number
  max: number
}

export interface MonthData {
  month: string
  iphone15: ModelSales
  iphone16: ModelSales
  iphone17: ModelSales
}

export type ChartData = MonthData[]

// ==================== Chart Config ====================
export type SeriesKey
  = | 'iphone15-base'
    | 'iphone15-plus'
    | 'iphone15-max'
    | 'iphone16-base'
    | 'iphone16-plus'
    | 'iphone16-max'
    | 'iphone17-base'
    | 'iphone17-plus'
    | 'iphone17-max'

export interface ChartConfigItem {
  label: string
  color: string
}

export interface SeriesTotal {
  type: 'base' | 'plus' | 'max'
  value: number
  fill: string
}

export interface TotalSales {
  iphone15: SeriesTotal[]
  iphone16: SeriesTotal[]
  iphone17: SeriesTotal[]
}

export type HoverOpacity = Partial<Record<SeriesKey, number>>
