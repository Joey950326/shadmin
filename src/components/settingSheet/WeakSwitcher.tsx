/** 色弱模式开关 */

import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAppState } from '@/store/modules/app'
import { Switch } from '../ui/switch'

interface WeakSwitcherProps {
  className?: string
  id?: string
}

export default function WeakSwitcher({ id, className }: WeakSwitcherProps) {
  const isColorWeak = useAppSelector<boolean>(state => state.app.isColorWeak)
  const dispatch = useAppDispatch()
  const handleCheckedChange = (checked: boolean) => {
    dispatch(setAppState({ isColorWeak: checked }))
  }

  return (
    <Switch id={id} className={cn(className)} checked={isColorWeak} onCheckedChange={handleCheckedChange} />
  )
}
