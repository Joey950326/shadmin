import { motion } from 'framer-motion'
import { useLocation } from 'react-router'
import { cn } from '@/lib/utils'

interface AnimateMotionProviderProps {
  children: React.ReactNode
  className?: string
}

export default function AnimateMotionProvider({ children, className }: AnimateMotionProviderProps) {
  const location = useLocation()

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className={cn('size-full', className)}
    >
      {children}
    </motion.div>
  )
}
