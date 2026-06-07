import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectIsDark, selectThemeMode, setIsDark } from '@/store/modules/app'
import { applyThemeMode, getSystemThemeMode } from './shared'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useAppDispatch()
  const isDark = useAppSelector(selectIsDark)
  const themeMode = useAppSelector(selectThemeMode)
  const isGray = useAppSelector(state => state.app.isGray)
  const isColorWeak = useAppSelector(state => state.app.isColorWeak)

  useEffect(() => {
    let isDark: boolean
    if (themeMode === 'system') {
      isDark = getSystemThemeMode() === 'dark'
    }
    else {
      isDark = themeMode === 'dark'
    }

    dispatch(setIsDark(isDark))
  }, [dispatch, themeMode])

  useEffect(() => {
    applyThemeMode(isDark)
  }, [isDark])

  // 灰色 / 色弱 模式（合并设置，避免互相覆盖）
  useEffect(() => {
    const root = document.documentElement
    const filters: string[] = []

    if (isGray)
      filters.push('grayscale(100%)')
    if (isColorWeak)
      filters.push('invert(80%)')

    root.style.filter = filters.length > 0 ? filters.join(' ') : 'none'
    root.style.transition = 'filter 0.45s ease'
  }, [isGray, isColorWeak])

  return (children)
}
