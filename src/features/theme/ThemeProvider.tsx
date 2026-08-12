import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectPrimaryColor, selectThemeMode, setIsDark } from '@/store/modules/app'
import { applyThemeMode, changeColorClass, getSystemThemeMode } from './shared'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useAppDispatch()
  const themeMode = useAppSelector(selectThemeMode)
  const isGray = useAppSelector(state => state.app.isGray)
  const isColorWeak = useAppSelector(state => state.app.isColorWeak)
  const primaryColor = useAppSelector(selectPrimaryColor)

  useEffect(() => {
    let isDark: boolean
    if (themeMode === 'system') {
      isDark = getSystemThemeMode() === 'dark'
    }
    else {
      isDark = themeMode === 'dark'
    }

    dispatch(setIsDark(isDark))
    applyThemeMode(isDark)
  }, [dispatch, themeMode])

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

  // 主题色
  useEffect(() => {
    changeColorClass(primaryColor)
  }, [primaryColor])

  return (children)
}
