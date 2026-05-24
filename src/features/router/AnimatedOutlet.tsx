import type { HTMLMotionProps } from 'framer-motion'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface AnimatedOutletProps {
  children: React.ReactNode
  className?: string
}

function AnimatedOutlet({ children, className }: AnimatedOutletProps) {
  const location = useLocation()
  const isMobile = useIsMobile()

  const motionProps = useMemo<HTMLMotionProps<'section'>>(() => {
    if (isMobile) {
      return {
        initial: { opacity: 0, rotateY: 90 },
        animate: { opacity: 1, rotateY: 0 },
        exit: { opacity: 0, rotateY: -90 },
        transition: { duration: 0.4, ease: 'easeInOut' },
      }
    }
    else {
      if (location.pathname === '/auth/login') {
      // 如果是登录页面,返回从左到右滑入动画
        return {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -50 },
          transition: { duration: 0.4, ease: 'easeInOut' },
        }
      }
      else if (location.pathname === '/auth/register') {
        // 如果是注册页面,返回从右到左滑入动画
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 50 },
          transition: { duration: 0.4, ease: 'easeInOut' },
        }
      }
      else {
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
          transition: { duration: 0.4, ease: 'easeInOut' },
        }
      }
    }
  }, [isMobile, location.pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={location.pathname}
        {...motionProps}
        className={cn(className)}
      >
        {children}
      </motion.section>
    </AnimatePresence>
  )
}

export default AnimatedOutlet
