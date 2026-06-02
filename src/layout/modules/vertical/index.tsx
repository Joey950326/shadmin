import { SidebarProvider } from '@/components/ui/sidebar'
import ChildrenRoute from '@/layout/components/ChildrenRoute'
import Header from '@/layout/components/Header'
import RouteTabs from '@/layout/components/routeTabs'
import Sider from '@/layout/components/Sider'

export default function VerticalLayout() {
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
            className="flex-1 size-full overflow-auto p-2 bg-primary/10"

          >
            <ChildrenRoute />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
