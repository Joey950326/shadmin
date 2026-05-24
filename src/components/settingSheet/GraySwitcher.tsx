/** 灰色模式开关 */

import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAppState } from '@/store/modules/app'
import { Switch } from '../ui/switch'

interface GraySwitcherProps {
  className?: string
  id?: string
}

export default function GraySwitcher({ id, className }: GraySwitcherProps) {
  const isGray = useAppSelector<boolean>(state => state.app.isGray)
  const dispatch = useAppDispatch()
  const handleCheckedChange = (checked: boolean) => {
    dispatch(setAppState({ isGray: checked }))
  }

  return (
    <Switch id={id} className={cn(className)} checked={isGray} onCheckedChange={handleCheckedChange} />
  )
}
