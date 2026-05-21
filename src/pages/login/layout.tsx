import { Outlet } from 'react-router'
import { LanguageDropMenu } from '@/features/lang/LanguageDropMenu'
import { ThemeToggle } from '@/features/theme/ThemeToggle'

const LoginLayout: React.FC = () => {
  return (
    <div className="box-border bg-background h-screen w-screen flex items-center justify-center overflow-hidden">

      <div className="box-border w-[94%] h-[90%] bg-foreground/20 rounded-lg p-4 flex flex-col">
        {/* 功能区 */}
        <section className="flex items-center justify-end gap-2 py-2">
          <ThemeToggle className="size-8" />
          <LanguageDropMenu buttonClassName="size-8" />
        </section>
        {/* 内容区 */}
        <section className="flex-1">
          <Outlet />
        </section>
      </div>

    </div>
  )
}

export default LoginLayout
