import { useOutlet } from 'react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import AnimateMotionProvider from '@/features/motion/animateMotionProvider'
import Header from '@/layout/components/Header'
import Sider from '@/layout/components/Sider'

export default function VerticalLayout() {
  const outletElement = useOutlet()
  return (

    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background size-full">
        {/* 左侧侧边栏 */}
        <Sider />

        {/* 右侧主体区域 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />

          {/* 主要内容区 */}
          <main
            className="flex-1 overflow-auto p-6 bg-primary/10"

          >
            <AnimateMotionProvider>
              {outletElement}
            </AnimateMotionProvider>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
