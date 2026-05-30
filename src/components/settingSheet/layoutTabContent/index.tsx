import type { LayoutType } from '@/store/modules/app'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

import { setAppState } from '@/store/modules/app'
import LayoutBox from './LayoutBox'
import TabSwitcher from './TabSwitcher'

export default function LayoutContent() {
  const mode = useAppSelector(state => state.app.layout)

  const dispatch = useAppDispatch()

  const handleModeChange = (newMode: LayoutType) => {
    dispatch(setAppState({ layout: newMode }))
  }

  return (
    <FieldGroup className="h-full max-w-sm">
      <Card className="box-border w-full border shadow-none">
        <CardHeader>
          <CardTitle>布局设置</CardTitle>
          <CardDescription>选择你喜欢的布局方式</CardDescription>
        </CardHeader>
        <CardContent>
          <LayoutBox className="w-full h-36 sm:h-32" mode={mode} onModeChange={handleModeChange} />
        </CardContent>
      </Card>
      <FieldLabel htmlFor="tab-switch">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>页面标签</FieldTitle>
            <FieldDescription>
              记录经常访问的页面，方便快速切换。可在标签页上右键关闭或刷新。
            </FieldDescription>
          </FieldContent>
          <TabSwitcher id="tab-switch" />
        </Field>
      </FieldLabel>
    </FieldGroup>
  )
}
