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

  // 灰色模式
  useEffect(() => {
    const root = document.documentElement
    if (isGray) {
      root.style.filter = 'grayscale(100%)'
      root.style.transition = 'filter 0.45s ease'
    }
    else {
      root.style.filter = 'none'
    }
  }, [isGray])

  // 色弱模式
  useEffect(() => {
    const root = document.documentElement
    if (isColorWeak) {
      root.style.filter = 'invert(80%)'
      root.style.transition = 'filter 0.45s ease'
    }
    else {
      root.style.filter = 'none'
    }
  }, [isColorWeak])

  return (children)
}
