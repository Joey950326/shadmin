import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectThemeMode, setThemeMode } from '@/store/modules/app'

interface ThemeButtonGroupsProps {
  className?: string
}

type ThemeMode = 'light' | 'dark' | 'system'

export default function ThemeButtonGroups({ className }: ThemeButtonGroupsProps) {
  const appThemeMode = useAppSelector(selectThemeMode) || 'system'
  const dispatch = useAppDispatch()
  const handleValueChange = (value: string) => {
    dispatch(setThemeMode(value as ThemeMode))
  }
  return (
    <ToggleGroup
      type="single"
      value={appThemeMode}
      onValueChange={handleValueChange}
      className={cn(className, 'inline-flex')}
      spacing={0}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem
        value="light"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <SunIcon />
      </ToggleGroupItem>

      <ToggleGroupItem
        value="dark"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <MoonIcon />
      </ToggleGroupItem>

      <ToggleGroupItem
        value="system"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <LaptopIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
