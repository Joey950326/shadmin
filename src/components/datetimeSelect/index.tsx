import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { enUS, zhCN } from 'react-day-picker/locale'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import TimePickerCmp from './TimePicker'

interface DatetimeSelectProps {
  value?: { from?: Date, to?: Date }
  onChange?: (range: { from: Date | undefined, to: Date | undefined }) => void
  className?: string
}

const now = new Date()

const localeMap: Record<'zh' | 'en', typeof zhCN> = {
  zh: zhCN,
  en: enUS,
}

export function DatetimeSelect({ value, onChange, className }: DatetimeSelectProps) {
  const { t } = useTranslation()
  const initDate = {
    from: value?.from ?? now,
    to: value?.to ?? now,
  }
  const [date, setDate] = useState<DateRange | undefined>(initDate)

  const [startTime, setStartTime] = useState<string>(() => value?.from ? format(value.from, 'HH:mm:ss') : '00:00:00')
  const [endTime, setEndTime] = useState<string>(() => value?.to ? format(value.to, 'HH:mm:ss') : '23:59:59')
  const currentLanguage = useAppSelector(state => state.app.language as 'zh' | 'en' | undefined)
  const calendarLocale = useMemo(() => {
    const lang = currentLanguage === 'en' ? 'en' : 'zh'
    return localeMap[lang]
  }, [currentLanguage])

  // 同步外部 value
  useEffect(() => {
    if (value) {
      setDate({ from: value.from, to: value.to })
      setStartTime(value.from ? format(value.from, 'HH:mm:ss') : '00:00:00')
      setEndTime(value.to ? format(value.to, 'HH:mm:ss') : '23:59:59')
    }
  }, [value])

  const updateRange = useCallback((newDate: DateRange | undefined) => {
    let from = newDate?.from
    let to = newDate?.to || from

    if (from) {
      const [sh, sm, ss] = startTime.split(':').map(Number)
      from = new Date(from)
      from.setHours(sh, sm, ss)
    }

    if (to) {
      const [eh, em, es] = endTime.split(':').map(Number)
      to = new Date(to)
      to.setHours(eh, em, es)
    }
    setDate({ from, to })
    onChange?.({ from, to })
  }, [endTime, onChange, startTime])

  const handleStartTimeChange = useCallback((time: string) => {
    setStartTime(time)
    if (date?.from) {
      const [h, m, s] = time.split(':').map(Number)
      const newFrom = new Date(date.from)
      newFrom.setHours(h, m, s)
      setDate(prev => ({ ...prev, from: newFrom }))
      onChange?.({ from: newFrom, to: date.to })
    }
  }, [date, onChange])

  const handleEndTimeChange = useCallback((time: string) => {
    setEndTime(time)
    if (date?.to || date?.from) {
      const target = date.to || date.from!
      const [h, m, s] = time.split(':').map(Number)
      const newTo = new Date(target)
      newTo.setHours(h, m, s)
      setDate(prev => ({ ...prev!, to: newTo }))
      onChange?.({ from: date.from, to: newTo })
    }
  }, [date, onChange])

  const displayText = useMemo(() => {
    if (!date?.from)
      return t('time.selectRange')
    return date.to ? `${format(date.from, 'yyyy-MM-dd HH:mm:ss')} - ${format(date.to, 'yyyy-MM-dd HH:mm:ss')}` : format(date.from, 'yyyy-MM-dd HH:mm:ss')
  }, [date, t])

  // 快捷按钮
  //   const setQuickRange = (type: string) => {
  //     const now = new Date()
  //     let from: Date
  //     let to: Date = now

  //     switch (type) {
  //       case 'today':
  //         from = new Date(now)
  //         from.setHours(0, 0, 0)
  //         to.setHours(23, 59, 59)
  //         break
  //       case 'yesterday':
  //         from = new Date(now)
  //         from.setDate(from.getDate() - 1)
  //         from.setHours(0, 0, 0)
  //         to = new Date(from)
  //         to.setHours(23, 59, 59)
  //         break
  //       case 'thisWeek':
  //         from = new Date(now)
  //         from.setDate(from.getDate() - from.getDay())
  //         from.setHours(0, 0, 0)
  //         to = new Date(from)
  //         to.setDate(to.getDate() + 6)
  //         to.setHours(23, 59, 59)
  //         break
  //       default:
  //         return
  //     }

  //     setDate({ from, to })
  //     setStartTime('00:00:00')
  //     setEndTime('23:59:59')
  //     onChange?.({ from, to })
  //   }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal bg-primary/5',
              !date?.from && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="w-full p-2 pt-12 relative overflow-hidden">

            {/* 时间输入区域 */}
            <div className="box-border absolute top-2 pr-4 w-full grid grid-cols-2 gap-4 ">
              <div>
                <TimePickerCmp
                  value={startTime}
                  onChange={handleStartTimeChange}
                />
              </div>
              <div>
                <TimePickerCmp
                  value={endTime}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>

            <Calendar
            //   initialFocus
              mode="range"
              month={date?.from}
              selected={date}
              onSelect={updateRange}
              numberOfMonths={2}
              locale={calendarLocale}
            />

            {/* 快捷选择 */}
            {/* <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuickRange('today')}>
                今天
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange('yesterday')}>
                昨天
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange('thisWeek')}>
                本周
              </Button>
            </div> */}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
