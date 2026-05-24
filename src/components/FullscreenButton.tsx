/** 全屏按钮，点击可以切换全屏模式 */

import { ExpandIcon, ShrinkIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

export default function FullscreenButton() {
  const { t } = useTranslation()
  const [isFullscreen, setIsFullscreen] = useState(false)
  //   console.log('render FullscreenButton, isFullscreen:', isFullscreen) // Debug log for fullscreen state
  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen()
    }
    else {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    }
  }, [isFullscreen])

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement)
  }, [])

  // 监听全屏状态变化，更新按钮状态
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [handleFullscreenChange])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(pre => !pre)}
            className="hover:bg-accent"
          >
            {!isFullscreen
              ? (
                  <ExpandIcon />
                )
              : (
                  <ShrinkIcon />
                )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isFullscreen ? t('header:shrinkFullscreen') : t('header:expandFullscreen')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
