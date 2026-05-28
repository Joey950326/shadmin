import { useOutlet } from 'react-router'
import AnimateMotionProvider from '@/features/motion/AnimateMotionProvider'
import Header from './Header'

export default function HorizontalLayout() {
  const outletElement = useOutlet()

  return (
    <div className="h-screen w-full flex flex-col ">
      <Header />
      <main className="flex-1 p-6 overflow-auto bg-primary/10">
        <AnimateMotionProvider>
          {outletElement}
        </AnimateMotionProvider>
      </main>
    </div>
  )
}
