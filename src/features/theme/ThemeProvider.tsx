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

  return (children)
}
