import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { LanguageProvider } from './features/lang/LanguageProvider'
import TopProgressBar from './features/router/TopProgressBar'
import { ThemeProvider } from './features/theme/ThemeProvider'

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="box-border min-h-screen w-screen ">
          <TopProgressBar />
          <Outlet />
          <Toaster />
        </div>
      </LanguageProvider>
    </ThemeProvider>

  )
}

export default App
