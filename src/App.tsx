import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { LanguageProvider } from './features/lang/LanguageProvider'
import TopProgressBar from './features/router/TopProgressBar'
import { ThemeProvider } from './features/theme/ThemeProvider'

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <div className="box-border min-h-screen w-screen ">
            <TopProgressBar />
            <Outlet />
            <Toaster />
          </div>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>

  )
}

export default App
