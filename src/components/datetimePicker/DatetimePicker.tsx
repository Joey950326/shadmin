import type { ReactNode } from 'react'
import { CalendarIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { getNow } from '@/utils'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { DatetimePickerContext } from './DatetimePickerContext'
import { getDateFromDate, getDateFromString, getDateFromTimestamp, getTimeFromDate } from './utils'

interface DatetimePickerProps {
  value?: Date | number
  onValueChange?: (val: Date) => void
  children: ReactNode
  className?: string
}

function DatetimePicker({ children, value, onValueChange, className }: DatetimePickerProps) {
  const { t } = useTranslation()
  const innerValue = useMemo(() => value ? getDateFromTimestamp(value) : getNow() as Date, [value])
  const [innerDate, setInnerDate] = useState<string>(() => getDateFromDate(innerValue))
  const [innerTime, setInnerTime] = useState<string>(() => getTimeFromDate(innerValue))

  const setDate = useCallback((val: string) => {
    setInnerDate(val)
  }, [])

  const setTime = useCallback((val: string) => {
    setInnerTime(val)
  }, [])

  const displayText = useMemo(() => {
    if (!innerDate && !innerTime) {
      return t('time.selectRange')
    }
    return `${innerDate} ${innerTime}`
  }, [innerDate, innerTime, t])

  useEffect(() => {
    const fullDateString = `${innerDate} ${innerTime}`
    const fullDate = getDateFromString(fullDateString)
    if (fullDate && onValueChange) {
      onValueChange(fullDate)
    }
  }, [innerDate, innerTime, onValueChange])

  useEffect(() => {
    setInnerDate(() => getDateFromDate(innerValue))
    setInnerTime(() => getTimeFromDate(innerValue))
  }, [innerValue])

  const contextValue = useMemo(() => ({
    time: innerTime,
    date: innerDate,
    setTime,
    setDate,
  }), [innerDate, innerTime, setDate, setTime])

  return (
    <DatetimePickerContext value={contextValue}>
      <div className={cn('flex flex-col gap-2', className)}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full  font-normal bg-primary/5',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="pr-2">{displayText}</span>

            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <div className="w-full p-2 relative overflow-hidden">
              {children}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </DatetimePickerContext>
  )
}

export default DatetimePicker
