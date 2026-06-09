import type { MouseEvent, ReactNode } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'
import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface RadioHeaderProps {
  id: string
  children: string | ReactNode
  defaultValue: string | number
  selectMap: Record<string, string>
  onSelect: (val: string) => void
}

function RadioHeader({ id, children, defaultValue, selectMap, onSelect }: RadioHeaderProps) {
  const selectedValue = defaultValue.toString()

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    onSelect('')
  }

  return (
    <div id={id}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-0">
            {children}
            {selectedValue
              ? (
                  <Badge onClick={handleClear}>
                    {selectMap[selectedValue]}
                    {' '}
                    <XIcon />
                  </Badge>
                )
              : <SearchIcon className="size-3" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-24 p-4" align="start">
          <div className="flex flex-row items-start gap-1 ">
            <RadioGroup value={selectedValue.toString()} onValueChange={onSelect}>
              {

                Object.entries(selectMap).map(([radioValue, radioLabel]) => {
                  return (
                    <div key={radioValue} className="flex items-center gap-3">
                      <RadioGroupItem value={radioValue} id={`status-radio-${radioValue}`} />
                      <Label htmlFor={`status-radio-${radioValue}`}>{radioLabel}</Label>
                    </div>
                  )
                })
              }

            </RadioGroup>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default memo(RadioHeader)
