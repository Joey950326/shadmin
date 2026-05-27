import type { LayoutType } from '@/store/modules/app'
import { CheckIcon } from 'lucide-react'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface LayoutBoxProps {
  className?: string
  mode: LayoutType
  onModeChange?: (mode: LayoutType) => void
}

interface BoxItemProps {
  className?: string
  checked: boolean
  onSelected: () => void
}

/** 经典布局 */
export function ClassicLayoutBox({ className, checked = false, onSelected }: BoxItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn('box-border relative flex flex-col gap-1 size-full', `${checked ? 'border-2' : ''}`, className)}
          onClick={(e) => {
            e.stopPropagation() // 阻止事件冒泡，避免触发外层的 onClick
            onSelected()
          }}
        >
          <div className="box-header w-full h-[20%] bg-foreground/30"></div>
          <div className="flex-1 flex flex-row gap-1 w-full">
            <div className="box-sidebar bg-foreground/20 w-[20%] h-full"></div>
            <div className="box-main flex-1 h-full bg-foreground/10 p-1">
            </div>
          </div>
          {checked && (
            <div className="absolute inset-0 flex size-full justify-center items-center shadow-xl bg-accent/50">
              <CheckIcon />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <span>经典布局</span>
      </TooltipContent>
    </Tooltip>
  )
}

/** 垂直布局 */
export function VerticalLayoutBox({ className, checked = false, onSelected }: BoxItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn('box-border relative flex flex-row gap-1 size-full', `${checked ? 'border-2' : ''}`, className)}
          onClick={(e) => {
            e.stopPropagation() // 阻止事件冒泡，避免触发外层的 onClick
            onSelected()
          }}
        >
          <div className="box-header w-[20%] h-full bg-foreground/30"></div>
          <div className="flex-1 flex flex-col gap-1 w-full">
            <div className="box-sidebar bg-foreground/20 h-[20%] w-full"></div>
            <div className="box-main flex-1 h-full bg-foreground/10 p-1">
            </div>
          </div>
          {checked && (
            <div className="absolute inset-0 flex size-full justify-center items-center shadow-xl bg-accent/50">
              <CheckIcon />
            </div>
          )}

        </div>
      </TooltipTrigger>
      <TooltipContent>
        <span>垂直布局</span>
      </TooltipContent>
    </Tooltip>

  )
}

/** 水平布局 */
export function HorizontalLayoutBox({ className, checked = false, onSelected }: BoxItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn('box-border relative flex flex-col gap-1 size-full', `${checked ? 'border-2' : ''}`, className)}
          onClick={(e) => {
            e.stopPropagation() // 阻止事件冒泡，避免触发外层的 onClick
            onSelected()
          }}
        >
          <div className="box-header w-full h-[20%] bg-foreground/30"></div>
          <div className="box-main flex-1 h-full bg-foreground/20 p-1">
          </div>
          {checked && (
            <div className="absolute inset-0 flex size-full justify-center items-center shadow-xl bg-accent/50">
              <CheckIcon />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <span>水平布局</span>
      </TooltipContent>
    </Tooltip>
  )
}

/** 列布局 */
export function ColumnLayoutBox({ className, checked = false, onSelected }: BoxItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn('box-border relative flex flex-row gap-1 size-full', `${checked ? 'border-2' : ''}`, className)}
          onClick={(e) => {
            e.stopPropagation() // 阻止事件冒泡，避免触发外层的 onClick
            onSelected()
          }}
        >
          <div className="box-sidebar w-[20%] h-full bg-foreground/30"></div>
          <div className="flex-1 flex flex-row gap-1 w-full">
            <div className="box-submenu bg-foreground/20 w-[20%] h-full"></div>
            <div className="box-main flex-1 h-full bg-foreground/10">
            </div>
          </div>
          {checked && (
            <div className="absolute inset-0 flex size-full justify-center items-center shadow-xl bg-accent/50">
              <CheckIcon />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <span>列布局</span>
      </TooltipContent>
    </Tooltip>
  )
}

export default function LayoutBox({ className, mode, onModeChange }: LayoutBoxProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutType | null>(mode)

  const handleModeChange = (newMode: LayoutType) => {
    setLayoutMode(newMode)
    onModeChange?.(newMode)
  }

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      <VerticalLayoutBox onSelected={() => handleModeChange('vertical')} className={className} checked={layoutMode === 'vertical'} />
      <ClassicLayoutBox onSelected={() => handleModeChange('classic')} className={className} checked={layoutMode === 'classic'} />
      <HorizontalLayoutBox onSelected={() => handleModeChange('horizontal')} className={className} checked={layoutMode === 'horizontal'} />
      <ColumnLayoutBox onSelected={() => handleModeChange('column')} className={className} checked={layoutMode === 'column'} />
    </div>
  )
}
