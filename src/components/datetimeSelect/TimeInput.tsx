import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface TimeInputProps {
  /** 时间字符串，格式 "HH:mm:ss" */
  value: string
  /** 值变化回调 */
  onChange: (time: string) => void
  /** 是否禁用 */
  disabled?: boolean
  className?: string
}

export function TimeInput({
  value = '00:00:00',
  onChange,
  disabled = false,
  className,
}: TimeInputProps) {
  // 解析当前值
  const [hour, minute, second] = value.split(':').map(v => v.padStart(2, '0'))

  const handleHourChange = (newHour: string) => {
    const newTime = `${newHour}:${minute}:${second}`
    onChange(newTime)
  }

  const handleMinuteChange = (newMinute: string) => {
    const newTime = `${hour}:${newMinute}:${second}`
    onChange(newTime)
  }

  const handleSecondChange = (newSecond: string) => {
    const newTime = `${hour}:${minute}:${newSecond}`
    onChange(newTime)
  }

  // 生成选项
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutesAndSeconds = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'))

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 小时 */}
      <Select value={hour} onValueChange={handleHourChange} disabled={disabled}>
        <SelectTrigger className="w-16 text-center">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hours.map(h => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground">:</span>

      {/* 分钟 */}
      <Select value={minute} onValueChange={handleMinuteChange} disabled={disabled}>
        <SelectTrigger className="w-16 text-center">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minutesAndSeconds.map(m => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground">:</span>

      {/* 秒 */}
      <Select value={second} onValueChange={handleSecondChange} disabled={disabled}>
        <SelectTrigger className="w-16 text-center">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minutesAndSeconds.map(s => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
