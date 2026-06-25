import ChildrenRoute from '@/layout/components/ChildrenRoute'
import RouteTabs from '@/layout/components/routeTabs'
import Header from './Header'

export default function HorizontalLayout() {
  return (
    <div className="h-screen w-full flex flex-col ">
      <Header />
      <RouteTabs />

      <main className="flex-1 p-2 overflow-auto bg-primary/10">
        <ChildrenRoute />
      </main>
    </div>
  )
}
