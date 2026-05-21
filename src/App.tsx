import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import TopProgressBar from './features/router/TopProgressBar'
import { ThemeProvider } from './features/theme/ThemeProvider'

export function App() {
  return (
    <ThemeProvider>
      <div className="box-border min-h-screen w-screen ">
        <TopProgressBar />
        <Outlet />
        <Toaster />
      </div>
    </ThemeProvider>

  )
}

export default App
