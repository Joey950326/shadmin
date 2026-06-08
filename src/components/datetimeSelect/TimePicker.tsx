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

interface TimePickerCmpPros {
  value: string
  onChange: (time: string) => void
  className?: string
}

function TimePickerCmp({ value, onChange, className }: TimePickerCmpPros) {
  return (
    <TimePicker
      defaultValue={value}
      onValueChange={onChange}
      className={cn('w-full ', className)}
      showSeconds
    >
      <TimePickerInputGroup className="rounded-xl bg-primary/5">
        <TimePickerInput segment="hour" />
        <TimePickerSeparator />
        <TimePickerInput segment="minute" />
        <TimePickerSeparator />
        <TimePickerInput segment="second" />
        <TimePickerTrigger />
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
