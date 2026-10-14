import { LoaderIcon } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import TreeItem from './TreeItem'
import { useTreeSelector } from './TreeSelectorContext'

interface TreeListProps {
  className?: string
  maxHeight?: string
}

function TreeList({
  className,
  maxHeight = '400px',
}: TreeListProps) {
  const { t } = useTranslation()
  const { filteredDepartments, isLoading } = useTreeSelector()

  if (isLoading) {
    return (
      <div className="bg-primary/10 size-full flex flex-col justify-center items-center gap-2">
        <LoaderIcon className="text-muted-foreground" />
        <span className="text-muted-foreground">{t('loadingData')}</span>
      </div>
    )
  }

  if (!isLoading && filteredDepartments.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">
        {t('tree.noMatchingDepartments')}
      </div>
    )
  }

  return (
    <ScrollArea
      className={cn(
        'p-2 size-full',
        className,
      )}
      style={{ maxHeight }}
    >
      {filteredDepartments.map(node => (
        <TreeItem key={node.id} node={node} />
      ))}

      <ScrollBar orientation="horizontal" />

    </ScrollArea>
  )
}

export default memo(TreeList)
