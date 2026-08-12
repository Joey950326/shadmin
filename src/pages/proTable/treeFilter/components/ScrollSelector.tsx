import type { JSX } from 'react'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface ItemValue {
  label: string
  value: string | number | boolean
}

interface ScrollSelectorProps<T> {
  data: T[]
  selected: T[]
  onSelectedChange?: (val: T[]) => void
  multiple?: boolean
}

interface ItemProps<T> {
  itemValue: T
  isActive: boolean
  onSelected: (val: T) => void
}

function Item<T extends ItemValue>({ itemValue, onSelected, isActive }: ItemProps<T>) {
  return (
    <Button
      size="sm"
      variant={isActive ? 'default' : 'outline'}
      className={cn(
        'h-8',
      )}
      onClick={() => onSelected(itemValue)}
    >
      {itemValue.label}
    </Button>
  )
}

function ScrollSelector<T extends ItemValue>({ data, selected, onSelectedChange, multiple = false }: ScrollSelectorProps<T>) {
  const { t } = useTranslation()
  const [innerSelected, setInnerSelected] = useState<T[]>(() => Array.from(selected))

  const handleSelected = (item: T) => {
    const index = innerSelected.findIndex(t => t.label === item.label)
    let newValue
    if (index === -1) {
      newValue = multiple ? innerSelected.concat(item) : [item]
    }
    else {
      newValue = innerSelected.filter((_, idx) => idx !== index)
    }
    setInnerSelected(newValue)
    onSelectedChange?.(newValue)
  }

  return (
    <Field orientation="horizontal" className="flex px-3 ">
      <Label className="w-1/6 max-w-32 shrink-0 text-sm">{t('tree.userStatusSingle')}</Label>
      <ScrollArea className="w-5/6 grow">
        <div
          className="w-full flex flex-row items-center gap-4 p-2"
        >
          {
            data.map(
              item => (
                <Item<T>
                  key={item.label}
                  itemValue={item}
                  onSelected={handleSelected}
                  isActive={innerSelected.some(t => t.label === item.label)}
                />
              ),
            )
          }

        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Field>
  )
}

const MemoScrollSelector = memo(ScrollSelector) as unknown as <T extends ItemValue>(props: ScrollSelectorProps<T>) => JSX.Element
export default MemoScrollSelector
