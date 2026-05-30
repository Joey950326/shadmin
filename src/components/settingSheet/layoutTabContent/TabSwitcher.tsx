/** 灰色模式开关 */

import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAppState } from '@/store/modules/app'

interface TabSwitcherProps {
  className?: string
  id?: string
}

export default function TabSwitcher({ id, className }: TabSwitcherProps) {
  const showTabs = useAppSelector<boolean>(state => state.app.showTabs)
  const dispatch = useAppDispatch()
  const handleCheckedChange = (checked: boolean) => {
    dispatch(setAppState({ showTabs: checked }))
  }

  return (
    <Switch id={id} className={cn(className)} checked={showTabs} onCheckedChange={handleCheckedChange} />
  )
}
