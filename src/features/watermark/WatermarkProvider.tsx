// components/ui/watermark.tsx
'use client'

import type { WatermarkOptions } from './types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCssVar } from '@/features/watermark/shared'
import { cn } from '@/lib/utils'

// ... 其他代码保持不变

interface WatermarkProps extends WatermarkOptions {
  className?: string
  /** 子元素（可选，水印会覆盖在 children 上方） */
  children?: React.ReactNode
}

export function WatermarkProvider({
  content,
  fontSize = 16,
  color = 'rgba(0, 0, 0, 0.15)',
  rotate = -22,
  gapX = 200,
  gapY = 100,
  opacity = 1,
  fontFamily = 'system-ui, -apple-system, sans-serif',
  fontWeight = 'normal',
  visible = true,
  zIndex = 999,
  className,
  children,
}: WatermarkProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 用于强制水印在主题切换后重新生成
  //   const [themeVersion, setThemeVersion] = useState(0)

  const getResolvedColor = useCallback(() => {
    return color.startsWith('--') || color.startsWith('var(')
      ? getCssVar(color)
      : color
  }, [color])

  const [resolvedColor, setResolvedColor] = useState<string>(() => getResolvedColor())

  /**
   * 监听主题变化（class / data-theme）
   * 关键点：使用双 requestAnimationFrame，确保浏览器已经完成样式重计算后再读取 CSS 变量
   */
  useEffect(() => {
    const handleThemeChange = () => {
      // 第一帧：等待当前帧结束
      requestAnimationFrame(() => {
        // 第二帧：确保样式已经应用完成
        requestAnimationFrame(() => {
          setResolvedColor(getResolvedColor())
        })
      })
    }

    const observer = new MutationObserver(handleThemeChange)

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'], // shadcn 常用这两种
    })

    return () => observer.disconnect()
  }, [getResolvedColor])

  // 生成水印（依赖 themeVersion，主题真正切换完成后才会重新执行）
  const watermarkUrl = useMemo(() => {
    if (!visible || !resolvedColor)
      return ''

    // 此时再读取 CSS 变量，已经是最新主题色
    // const resolvedColor
    //   = color.startsWith('--') || color.startsWith('var(')
    //     ? getCssVar(color)
    //     : color

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return ''

    const texts = Array.isArray(content) ? content : [content]

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    const textWidths = texts.map(t => ctx.measureText(t).width)
    const maxTextWidth = Math.max(...textWidths, 0)
    const lineHeight = fontSize * 1.4
    const textHeight = texts.length * lineHeight

    const angle = (rotate * Math.PI) / 180
    const cos = Math.abs(Math.cos(angle))
    const sin = Math.abs(Math.sin(angle))

    const tileWidth = Math.ceil(maxTextWidth * cos + textHeight * sin) + gapX
    const tileHeight = Math.ceil(maxTextWidth * sin + textHeight * cos) + gapY

    canvas.width = tileWidth
    canvas.height = tileHeight

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    ctx.fillStyle = resolvedColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.globalAlpha = opacity

    ctx.translate(tileWidth / 2, tileHeight / 2)
    ctx.rotate(angle)

    texts.forEach((text, index) => {
      const y = (index - (texts.length - 1) / 2) * lineHeight
      ctx.fillText(text, 0, y)
    })

    return canvas.toDataURL('image/png')
  }, [content, fontSize, rotate, gapX, gapY, opacity, fontFamily, fontWeight, visible, resolvedColor])

  // ... 后面渲染部分保持不变
  if (!visible || !watermarkUrl) {
    return <>{children}</>
  }

  return (
    <div className={cn('relative h-full w-full', className)}>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 select-none"
        style={{
          zIndex,
          backgroundImage: watermarkUrl ? `url(${watermarkUrl})` : undefined,
          backgroundRepeat: 'repeat',
          backgroundPosition: '0 0',
        }}
      />
      {children}
    </div>
  )
}
