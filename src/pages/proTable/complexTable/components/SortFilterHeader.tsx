import type { MouseEvent, ReactNode } from 'react'
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, MenuIcon, XIcon } from 'lucide-react'
import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type SortType = 'desc' | 'asc' | 'false'

interface SortFilterHeaderProps<FilterType> {
  id: string
  children: string | ReactNode
  filterValue?: string
  onFilterChange?: (val: FilterType) => void
  sortValue?: SortType
  onSortChange?: (val: SortType) => void
}

function SortFilterHeader<T,>({ id, children, filterValue, onFilterChange, sortValue, onSortChange }: SortFilterHeaderProps<T>) {
  const currentFilter = filterValue ?? ''
  const currentSort = sortValue ?? 'false'

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    onFilterChange?.('' as T)
  }

  const sortDisabled = !onSortChange

  const filterDisabled = !onFilterChange

  return (
    <div id={id}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-0">
            {children}
            {(!filterDisabled && currentFilter)
              ? (
                  <Badge onClick={e => handleClear(e)}>
                    {currentFilter}
                    {' '}
                    <XIcon />
                  </Badge>
                )
              : (
                  <MenuIcon
                    className="size-3"
                  />
                )}
            {
              !sortDisabled && (
                <>
                  {currentSort === 'desc' && <ArrowDownIcon />}
                  {currentSort === 'asc' && <ArrowUpIcon />}
                  {!currentSort && <ArrowUpDownIcon />}
                </>
              )

            }

          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-60 p-4" align="start">
          {
            !filterDisabled && (
              <div className="flex flex-row items-center gap-1 ">
                <Label className="shrink-0" htmlFor="usernameFilter">筛选：</Label>
                <Input
                  size={16}
                  className="flex-1 h-8"
                  id="usernameFilter"
                  placeholder="请输入用户名"
                  value={currentFilter}
                  onChange={e => onFilterChange?.(e.target.value as T)}
                />
              </div>
            )
          }
          {
            !sortDisabled && (
              <div className="flex flex-row items-center gap-1">
                <Label className="shrink">排序：</Label>
                <ToggleGroup
                  value={currentSort.toString()}
                  onValueChange={val => onSortChange?.(val as SortType)}
                  className="gap-0"
                  type="single"
                  variant="outline"
                  size="sm"
                >
                  <ToggleGroupItem value="desc" className="rounded-r-none">
                    <ArrowDownIcon />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="asc" className="rounded-none border-x-none">
                    <ArrowUpIcon />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="false" className="rounded-l-none">
                    <ArrowUpDownIcon />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )
          }

        </PopoverContent>
      </Popover>
    </div>
  )
}

export default memo(SortFilterHeader) as <T = unknown>(
  props: SortFilterHeaderProps<T>,
) => React.JSX.Element

// export default SortFilterHeader
