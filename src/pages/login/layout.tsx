import { useOutlet } from 'react-router'
import LanguageDropMenu from '@/features/lang/LanguageDropMenu'
import AnimatedOutlet from '@/features/router/AnimatedOutlet'
import ThemeToggle from '@/features/theme/ThemeToggle'

const LoginLayout: React.FC = () => {
  const OutletElement = useOutlet()

  return (
    <div className="box-border bg-background h-screen w-screen flex items-center justify-center overflow-hidden">

      <div className="box-border w-[94%] h-[90%] bg-primary/20 rounded-lg p-4 flex flex-col">
        {/* 功能区 */}
        <section className="flex items-center justify-end gap-2 py-2">
          <ThemeToggle className="size-8" />
          <LanguageDropMenu buttonClassName="size-8" />
        </section>
        {/* 内容区 */}
        {/* 使用AnimatePresence和motion实现路由切换动画 */}

        <AnimatedOutlet className="flex-1">
          {OutletElement}
        </AnimatedOutlet>

      </div>

    </div>
  )
}

export default LoginLayout
