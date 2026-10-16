import { useOutlet } from 'react-router'
import { ScrollArea } from '@/components/ui/scroll-area'
import AnimateMotionProvider from '@/features/motion/AnimateMotionProvider'
import { useAppSelector } from '@/store/hooks'
import { selectTabsReloadFlag } from '@/store/modules/app'

export default function ChildrenRoute() {
  const tabsReloadFlag = useAppSelector(selectTabsReloadFlag)
  const outletElement = useOutlet()
  return (
    <ScrollArea className="size-full">
      <AnimateMotionProvider className="h-auto min-h-full">
        {tabsReloadFlag && outletElement}
      </AnimateMotionProvider>
    </ScrollArea>
  )
}
