import { SidebarProvider } from '@/components/ui/sidebar'
import ChildrenRoute from '@/layout/components/ChildrenRoute'
import Header from '@/layout/components/Header'
import RouteTabs from '@/layout/components/routeTabs'
import Sider from '@/layout/components/Sider'

const SIDEBAR_Z_INDEX = 10
const HEADER_HEIGHT = 16
const HEADER_Z_INDEX = SIDEBAR_Z_INDEX + 10

export default function ClassicLayout() {
  return (

    <SidebarProvider>
      <div className="size-full flex flex-col h-screen overflow-hidden bg-background ">
        {/* 头部 */}
        <Header showLogo className={`w-full shrink-0 h-${HEADER_HEIGHT}, z-${HEADER_Z_INDEX}`} />

        {/* 主体区域 */}
        <div className="flex flex-1 flex-row overflow-hidden">
          {/* 左侧侧边栏 */}

          <Sider />

          {/* 主要内容区 */}
          <div className="flex-1 w-full h-full flex-col overflow-hidden">
            <RouteTabs />
            <main
              className="flex-1 h-full overflow-auto p-2 bg-primary/10"
            >
              <ChildrenRoute />
            </main>
          </div>

        </div>
      </div>
    </SidebarProvider>
  )
}
