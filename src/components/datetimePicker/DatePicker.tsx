import { enUS, zhCN } from 'date-fns/locale'
import { memo, useMemo, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { Calendar } from '../ui/calendar'
import { useDatetimePicker } from './DatetimePickerContext'
import { getDateFromDate } from './utils'

interface DatePickerProps {
  value?: Date
  onValueChange?: (val: Date) => void
}

const localeMap: Record<'zh' | 'en', typeof zhCN> = {
  zh: zhCN,
  en: enUS,
}

function DatePicker({ value, onValueChange }: DatePickerProps) {
  const { date, setDate } = useDatetimePicker()
  const [innerDate, setInnerDate] = useState<Date>(() => value ?? new Date(date))
  const handleDateChange = (val: Date) => {
    setInnerDate(val)
    const dateString = getDateFromDate(val)
    setDate(dateString)
    onValueChange?.(val)
  }

  const currentLanguage = useAppSelector(state => state.app.language as 'zh' | 'en' | undefined)

  const calendarLocale = useMemo(() => {
    const lang = currentLanguage === 'en' ? 'en' : 'zh'
    return localeMap[lang]
  }, [currentLanguage])

  return (
    <div>

      <Calendar
        mode="single"
        required
        selected={innerDate}
        onSelect={handleDateChange}
        defaultMonth={innerDate}
        locale={calendarLocale}
      />

    </div>
  )
}

export default memo(DatePicker)
