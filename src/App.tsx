import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import TopProgressBar from './features/router/TopProgressBar'

export function App() {
  return (
    <div className="box-border min-h-screen w-screen ">
      <TopProgressBar />
      <Outlet />
      <Toaster />
    </div>
  )
}

export default App
