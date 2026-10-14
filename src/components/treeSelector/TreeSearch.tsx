import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { useTreeSelector } from './TreeSelectorContext'

interface TreeSearchProps {
  placeholder?: string
}
function TreeSearch({
  placeholder,
}: TreeSearchProps) {
  const { t } = useTranslation()
  const { searchTerm, setSearchTerm } = useTreeSelector()

  return (
    <div className="p-2 border-b">
      <div className="relative">
        <Input
          placeholder={placeholder ?? t('tree.searchDepartment')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="h-8"
        />
      </div>
    </div>
  )
}

export default memo(TreeSearch)

TreeSearch.displayName = 'TreeSearch'
