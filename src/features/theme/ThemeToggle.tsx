import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectThemeMode, setThemeMode as setAppThemeMode } from '@/store/modules/app'

interface ThemeToggleProps {
  className?: string
}

type ThemeMode = 'light' | 'dark' | 'system'
const themeModeSquences: ThemeMode[] = ['light', 'dark', 'system']

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const dispatch = useAppDispatch()
  const [themeMode, setThemeMode] = useState<ThemeMode>(useAppSelector(selectThemeMode) || 'system')

  const toggleThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode)
    dispatch(setAppThemeMode(mode))
  }

  const handleToggle = () => {
    const index = themeModeSquences.findIndex(mode => mode === themeMode)
    const nextIndex = (index + 1) % themeModeSquences.length
    const nextThemeMode = themeModeSquences[nextIndex]
    toggleThemeMode(nextThemeMode)
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle} className={className}>
      {themeMode === 'light' && <SunIcon />}
      {themeMode === 'dark' && <MoonIcon />}
      {themeMode === 'system' && <LaptopIcon />}
    </Button>
  )
}
