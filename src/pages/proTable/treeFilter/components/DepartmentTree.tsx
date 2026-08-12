import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TreeList, TreeSearch, TreeSelector } from '@/components/treeSelector'
import { useDepartmentList } from '@/services/api/hooks/useDepartment'

interface DepartmentTreeProps {
  onSelectedChange?: (val: Array<string>) => void
}

function DepartmentTree({ onSelectedChange }: DepartmentTreeProps) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Array<string>>()

  const { data, isLoading } = useDepartmentList()

  const handleSelectedChange = (val: Array<string>) => {
    setSelected(val)
    onSelectedChange?.(val)
  }

  return (
    <TreeSelector
      className="size-full"
      selectValue={data?.data || []}
      selectedIds={selected}
      onSelectedChange={handleSelectedChange}
      isLoading={isLoading}
    >
      <TreeSearch placeholder={t('tree.searchDepartmentName')} />
      <TreeList maxHeight="500px" />
    </TreeSelector>
  )
}

export default memo(DepartmentTree)
