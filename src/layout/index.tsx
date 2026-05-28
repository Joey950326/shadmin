import { useAppSelector } from '@/store/hooks.ts'
import ClassicLayout from './modules/classic/index.tsx'
import HorizontalLayout from './modules/horizontal/index.tsx'
import VerticalLayout from './modules/vertical/index.tsx'

export default function AuthLayout() {
  const layoutMode = useAppSelector(state => state.app.layout)

  return (
    <div className="relative size-full">
      {/* 两个布局同时挂载，通过样式控制显示，保留 DOM 不卸载， 如果有性能问题，切换成block和hidden */}
      <div
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${layoutMode === 'vertical'
          ? 'opacity-100 visible'
          : 'opacity-0 invisible pointer-events-none'}`}
        aria-hidden={layoutMode !== 'vertical'}
      >
        <VerticalLayout />
      </div>
      <div
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${layoutMode === 'classic'
          ? 'opacity-100 visible'
          : 'opacity-0 invisible pointer-events-none'}`}
        aria-hidden={layoutMode !== 'classic'}
      >
        <ClassicLayout />
      </div>
      <div
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${layoutMode === 'horizontal'
          ? 'opacity-100 visible'
          : 'opacity-0 invisible pointer-events-none'}`}
        aria-hidden={layoutMode !== 'horizontal'}
      >
        <HorizontalLayout />
      </div>
    </div>
  )
}
