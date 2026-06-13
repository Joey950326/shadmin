import { memo } from 'react'
import { Input } from '@/components/ui/input'
import { useTreeSelector } from './treeSelectorContext'

interface TreeSearchProps {
  placeholder?: string
}
function TreeSearch({
  placeholder = '搜索部门...',
}: TreeSearchProps) {
  const { searchTerm, setSearchTerm } = useTreeSelector()

  return (
    <div className="p-2 border-b">
      <div className="relative">
        <Input
          placeholder={placeholder}
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
