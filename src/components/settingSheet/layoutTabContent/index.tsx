import type { LayoutType } from '@/store/modules/app'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAppState } from '@/store/modules/app'

import LayoutBox from './LayoutBox'

export default function LayoutContent() {
  const mode = useAppSelector(state => state.app.layout)

  const dispatch = useAppDispatch()

  const handleModeChange = (newMode: LayoutType) => {
    dispatch(setAppState({ layout: newMode }))
  }

  return (
    <Card className="box-border w-full border">
      <CardHeader>
        <CardTitle>布局设置</CardTitle>
        <CardDescription>选择你喜欢的布局方式</CardDescription>
      </CardHeader>
      <CardContent>
        <LayoutBox className="w-full h-36 sm:h-32" mode={mode} onModeChange={handleModeChange} />
      </CardContent>
    </Card>
  )
}
