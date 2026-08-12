import type { LayoutType } from '@/store/modules/app'
import { CheckIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  title: string
}

/** 经典布局 */
export function ClassicLayoutBox({ className, checked = false, onSelected, title }: BoxItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn('box-border relative flex flex-col gap-1 size-full', `${checked ? 'border-2! border-dashed! border-primary/50' : ''}`, className)}
          onClick={(e) => {
            e.stopPropagation() // 阻止事件冒泡，避免触发外层的 onClick
            onSelected()
          }}
        >
          <div className="box-header w-full h-[20%] bg-primary/50"></div>
          <div className="flex-1 flex flex-row gap-1 w-full">
            <div className="box-sidebar bg-primary/40 w-[20%] h-full"></div>
            <div className="box-main flex-1 h-full bg-primary/30 p-1">
            </div>
          </div>
          {checked && (
            <div className={cn('absolute inset-0 flex size-full justify-center items-center shadow-xl', { 'bg-primary/20!': checked })}>
              <CheckIcon className="text-primary" />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <span>{title}</span>
      </TooltipContent>
    </Tooltip>
  )
}

/** 垂直布局 */
export function VerticalLayoutBox({ className, checked = false, onSelected, title }: BoxItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn('box-border relative flex flex-row gap-1 size-full', `${checked ? 'border-2 border-dashed border-primary/50' : ''}`, className)}
          onClick={(e) => {
            e.stopPropagation() // 阻止事件冒泡，避免触发外层的 onClick
            onSelected()
          }}
        >
          <div className="box-header w-[20%] h-full bg-primary/50"></div>
          <div className="flex-1 flex flex-col gap-1 w-full">
            <div className="box-sidebar bg-primary/40 h-[20%] w-full"></div>
            <div className="box-main flex-1 h-full bg-primary/30 p-1">
            </div>
          </div>
          {checked && (
            <div className={cn('absolute inset-0 flex size-full justify-center items-center shadow-xl', { 'bg-primary/20!': checked })}>
              <CheckIcon className="text-primary" />
            </div>
          )}

        </div>
      </TooltipTrigger>
      <TooltipContent>
        <span>{title}</span>
      </TooltipContent>
    </Tooltip>

  )
}

/** 水平布局 */
export function HorizontalLayoutBox({ className, checked = false, onSelected, title }: BoxItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn('box-border relative flex flex-col gap-1 size-full', `${checked ? 'border-2 border-dashed border-primary/50' : ''}`, className)}
          onClick={(e) => {
            e.stopPropagation() // 阻止事件冒泡，避免触发外层的 onClick
            onSelected()
          }}
        >
          <div className="box-header w-full h-[20%] bg-primary/50"></div>
          <div className="box-main flex-1 h-full bg-primary/40 p-1">
          </div>
          {checked && (
            <div className={cn('absolute inset-0 flex size-full justify-center items-center shadow-xl', { 'bg-primary/20!': checked })}>
              <CheckIcon className="text-primary" />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <span>{title}</span>
      </TooltipContent>
    </Tooltip>
  )
}

/** 列布局 */
export function ColumnLayoutBox({ className, checked = false, onSelected, title }: BoxItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn('box-border relative flex flex-row gap-1 size-full', `${checked ? 'border-2 border-dashed border-primary/50' : ''}`, className)}
          onClick={(e) => {
            e.stopPropagation() // 阻止事件冒泡，避免触发外层的 onClick
            onSelected()
          }}
        >
          <div className="box-sidebar w-[20%] h-full bg-primary/50"></div>
          <div className="flex-1 flex flex-row gap-1 w-full">
            <div className="box-submenu bg-primary/40 w-[20%] h-full"></div>
            <div className="box-main flex-1 h-full bg-primary/30">
            </div>
          </div>
          {checked && (
            <div className={cn('absolute inset-0 flex size-full justify-center items-center shadow-xl', { 'bg-primary/20!': checked })}>
              <CheckIcon />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <span>{title}</span>
      </TooltipContent>
    </Tooltip>
  )
}

export default function LayoutBox({ className, mode, onModeChange }: LayoutBoxProps) {
  const { t } = useTranslation()
  const [layoutMode, setLayoutMode] = useState<LayoutType | null>(mode)

  const handleModeChange = (newMode: LayoutType) => {
    setLayoutMode(newMode)
    onModeChange?.(newMode)
  }

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      <VerticalLayoutBox title={t('settings.verticalLayout')} onSelected={() => handleModeChange('vertical')} className={className} checked={layoutMode === 'vertical'} />
      <ClassicLayoutBox title={t('settings.classicLayout')} onSelected={() => handleModeChange('classic')} className={className} checked={layoutMode === 'classic'} />
      <HorizontalLayoutBox title={t('settings.horizontalLayout')} onSelected={() => handleModeChange('horizontal')} className={className} checked={layoutMode === 'horizontal'} />
      <ColumnLayoutBox title={t('settings.columnLayout')} onSelected={() => handleModeChange('column')} className={className} checked={layoutMode === 'column'} />
    </div>
  )
}
