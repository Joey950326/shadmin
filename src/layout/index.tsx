import type { ComponentType } from 'react'
import type { LayoutType } from '@/store/modules/app.ts'
import { useNavigation } from 'react-router'
import FullScreenLoader from '@/components/LoadingScreen.tsx'
import { useAppSelector } from '@/store/hooks.ts'
import ClassicLayout from './modules/classic/index.tsx'
import ColumnLayout from './modules/column/index.tsx'
import HorizontalLayout from './modules/horizontal/index.tsx'
import VerticalLayout from './modules/vertical/index.tsx'

const layouts: Record<LayoutType, ComponentType> = {
  vertical: VerticalLayout,
  classic: ClassicLayout,
  horizontal: HorizontalLayout,
  column: ColumnLayout,
}

export default function AuthLayout() {
  const layoutMode = useAppSelector(state => state.app.layout)
  const navigation = useNavigation()
  const Layout = layouts[layoutMode]

  return (
    <>
      <FullScreenLoader className="size-full" open={navigation.state !== 'idle'} />
      <div className="relative size-full">
        <Layout />
      </div>
    </>
  )
}
