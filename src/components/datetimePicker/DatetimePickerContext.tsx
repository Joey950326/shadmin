import { createContext, use } from 'react'

interface ContextValue {
  time: string
  date: string
  setTime: (val: string) => void
  setDate: (val: string) => void
}

export const DatetimePickerContext = createContext<ContextValue | null>(null)

export function useDatetimePicker() {
  const context = use(DatetimePickerContext)
  if (!context) {
    throw new Error('useDatetimePicker must used in DatetimePicker')
  }
  return context
}
