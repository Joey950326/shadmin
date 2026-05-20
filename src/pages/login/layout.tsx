import { Outlet } from 'react-router'

const LoginLayout: React.FC = () => {
  return (
    <div className="box-border bg-background h-screen w-screen flex items-center justify-center overflow-hidden">

      <div className="box-border w-[94%] h-[90%] bg-foreground/20 rounded-lg p-4 flex flex-col">
        {/* 功能区 */}
        <section className="flex justify-end gap-4 py-2">
          <div>主题切换</div>
          <div>语言切换</div>
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
