import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { LanguageProvider } from './features/lang/LanguageProvider'
import TopProgressBar from './features/router/TopProgressBar'
import { ThemeProvider } from './features/theme/ThemeProvider'
import { WatermarkProvider } from './features/watermark/WatermarkProvider'

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <WatermarkProvider content="shadmin" color="var(--color-primary)" opacity={0.1}>
          <TooltipProvider>
            <div className="box-border min-h-screen w-screen ">
              <TopProgressBar />
              <Outlet />
              <Toaster />
            </div>
          </TooltipProvider>
        </WatermarkProvider>
      </LanguageProvider>
    </ThemeProvider>

  )
}

export default App
