import { memo } from 'react'
import {
  TimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerMinute,
  TimePickerSecond,
  TimePickerSeparator,
  TimePickerTrigger,
} from '@/components/diceui/time-picker'
import { cn } from '@/lib/utils'
import { useDatetimePicker } from './DatetimePickerContext'

interface TimePickerCmpPros {
  value?: string
  onChange?: (time: string) => void
  className?: string
}

function TimePickerCmp({ value, onChange, className }: TimePickerCmpPros) {
  const { time, setTime } = useDatetimePicker()
  const innerValue = value ?? time
  const handleChange = (val: string) => {
    setTime(val)
    onChange?.(val)
  }
  return (
    <TimePicker
      defaultValue={innerValue}
      onValueChange={handleChange}
      className={cn('w-full min-w-36 ', className)}
      showSeconds
    >
      <TimePickerInputGroup className="rounded-xl bg-primary/5">
        <TimePickerInput segment="hour" />
        <TimePickerSeparator />
        <TimePickerInput segment="minute" />
        <TimePickerSeparator />
        <TimePickerInput segment="second" />
        <TimePickerTrigger className="size-4" />
      </TimePickerInputGroup>
      <TimePickerContent className="w-full flex flex-row gap-1 shadow-xl pb-2">
        <TimePickerHour />
        <TimePickerMinute />
        <TimePickerSecond />
      </TimePickerContent>
    </TimePicker>
  )
}

export default memo(TimePickerCmp)
