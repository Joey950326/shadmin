import type { ReactNode } from 'react'
import { useCallback, useEffect } from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useRouteTabListContext } from './hooks'

interface RouteTabListProps {
  children?: ReactNode
  className?: string
}

export default function RouteTabList({ children, className }: RouteTabListProps) {
  const { scrollContainerRef, activeTabItem, activeTabRef } = useRouteTabListContext()

  // 判断元素是否在容器可视区域内（仅水平方向）
  const isElementInViewport = useCallback((element: HTMLElement, container: HTMLElement): boolean => {
    const elementRect = element.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    return (
      elementRect.left >= containerRect.left
      && elementRect.right <= containerRect.right
    )
  }, [])

  // 鼠标滚轮横向滚动核心逻辑
  useEffect(() => {
    const scrollContainer = scrollContainerRef?.current
    if (!scrollContainer)
      return

    const viewport = scrollContainer.querySelector(
      '[data-radix-scroll-area-viewport]',
    ) as HTMLDivElement | null

    if (!viewport)
      return

    const handleWheel = (e: WheelEvent) => {
      // 如果按住 Shift 键，则保持默认行为（垂直滚动）
      if (e.shiftKey)
        return

      // 只有当垂直滚动量较大时才转换为横向（避免误触）
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        viewport.scrollLeft += e.deltaY * 1.2 // 1.2 可微调灵敏度
      }
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      viewport.removeEventListener('wheel', handleWheel)
    }
  }, [scrollContainerRef])

  // 当激活标签变化时，检查是否需要滚动
  useEffect(() => {
    const activeElement = activeTabRef?.current
    const container = scrollContainerRef?.current

    if (!activeElement || !container)
      return

    // 先检查是否已经在视口内
    if (!isElementInViewport(activeElement, container)) {
      // 不在视口内才执行滚动，居中显示
      activeElement.scrollIntoView({
        behavior: 'smooth',
        // inline: 'center', // 水平居中
        block: 'nearest',
      })
    }
  }, [activeTabItem, activeTabRef, isElementInViewport, scrollContainerRef])

  return (
    <ScrollArea ref={scrollContainerRef} className={cn('size-full flex-1 min-w-0 max-w-[calc(100vw-4rem)] flex items-center', className)}>
      <div
        className="flex size-full items-center overflow-y-hidden min-w-max gap-2"
      >
        {children}
      </div>
      <ScrollBar
        orientation="horizontal"
        className={cn(
          'h-1.5 hover:h-2 transition-all duration-200',
          '[&>div]:bg-muted-foreground/40 hover:[&>div]:bg-muted-foreground/70',
          'dark:[&>div]:bg-muted-foreground/50 dark:hover:[&>div]:bg-muted-foreground',
        )}
      />
    </ScrollArea>
  )
}
