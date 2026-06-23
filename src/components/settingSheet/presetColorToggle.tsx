import { CheckIcon } from 'lucide-react'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectPrimaryColor, setPrimaryColor } from '@/store/modules/app'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'

interface PresetColorToggleProps {
  id: string
}

function PresetColorToggle({ id }: PresetColorToggleProps) {
  const primaryColor = useAppSelector(selectPrimaryColor)
  const dispatch = useAppDispatch()

  const syncPrimaryColor = useCallback((color: string) => {
    dispatch(setPrimaryColor(color || ''))
  }, [dispatch])

  const handlePresetColorChange = (color: string) => {
    syncPrimaryColor(color)
  }

  return (
    <ToggleGroup onValueChange={handlePresetColorChange} id={id} type="single" size="sm" defaultValue="top">
      <ToggleGroupItem
        value="orange"
        aria-label="Toggle orange"
        className="bg-orange-500! hover:bg-orange-400! p-0"
      >
        <CheckIcon className={cn(
          primaryColor === 'orange' ? 'opacity-100' : 'opacity-0',
        )}
        />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="blue"
        aria-label="Toggle blue"
        className="bg-blue-500! hover:bg-blue-400! p-0"
      >
        <CheckIcon className={cn(
          primaryColor === 'blue' ? 'opacity-100' : 'opacity-0',
        )}
        />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="rose"
        aria-label="Toggle rose"
        className="bg-rose-500! hover:bg-rose-400! p-0"
      >
        <CheckIcon className={cn(
          primaryColor === 'rose' ? 'opacity-100' : 'opacity-0',
        )}
        />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="green"
        aria-label="Toggle green"
        className="bg-green-500! hover:bg-green-400! p-0"
      >
        <CheckIcon className={cn(
          primaryColor === 'green' ? 'opacity-100' : 'opacity-0',
        )}
        />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export default PresetColorToggle
