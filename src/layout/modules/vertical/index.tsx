import { useOutlet } from 'react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import AnimateMotionProvider from '@/features/motion/AnimateMotionProvider'
import Header from '@/layout/components/Header'
import RouteTabs from '@/layout/components/routeTabs'
import Sider from '@/layout/components/Sider'
import { useAppSelector } from '@/store/hooks'
import { selectTabsReloadFlag } from '@/store/modules/app'

export default function VerticalLayout() {
  const tabsReloadFlag = useAppSelector(selectTabsReloadFlag)
  const outletElement = useOutlet()

  return (

    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background size-full">
        {/* 左侧侧边栏 */}
        <Sider />

        {/* 右侧主体区域 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <RouteTabs />

          {/* 主要内容区 */}
          <main
            className="flex-1 overflow-auto p-6 bg-primary/10"

          >
            <AnimateMotionProvider>
              {tabsReloadFlag && outletElement}
            </AnimateMotionProvider>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
