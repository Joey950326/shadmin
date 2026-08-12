import { useTranslation } from 'react-i18next'
// components/FullScreenLoader.tsx
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface FullScreenLoaderProps {
  open: boolean
  text?: string
  className?: string
}

export default function FullScreenLoader({
  open,
  text,
  className,
}: FullScreenLoaderProps) {
  const { t } = useTranslation()
  const loaderText = text ?? t('loading')

  if (!open)
    return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-9999 flex items-center justify-center',
        'bg-foreground/10 backdrop-blur-md', // 半透明黑色 + 毛玻璃效果
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-16 w-16 text-ring" />

        {loaderText && (
          <p className="text-ring text-sm font-medium tracking-wide">
            {loaderText}
          </p>
        )}
      </div>
    </div>
  )
}
