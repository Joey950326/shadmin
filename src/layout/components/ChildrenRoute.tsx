import { useOutlet } from 'react-router'
import AnimateMotionProvider from '@/features/motion/AnimateMotionProvider'
import { useAppSelector } from '@/store/hooks'
import { selectTabsReloadFlag } from '@/store/modules/app'

export default function ChildrenRoute() {
  const tabsReloadFlag = useAppSelector(selectTabsReloadFlag)
  const outletElement = useOutlet()
  return (
    <AnimateMotionProvider>
      {tabsReloadFlag && outletElement}
    </AnimateMotionProvider>
  )
}
