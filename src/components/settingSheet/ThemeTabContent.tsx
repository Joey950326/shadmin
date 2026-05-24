import ThemeButtonGroups from '@/features/theme/ThemeToggleGroups'
import { cn } from '@/lib/utils'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from '../ui/field'
import GraySwitcher from './GraySwitcher'
import WeakSwitcher from './WeakSwitcher'

interface ThemeTabContentProps {
  className?: string
}

export default function ThemeTabContent({ className }: ThemeTabContentProps) {
  return (
    <FieldGroup className={cn('h-full max-w-sm px-4 py-2', className)}>
      <FieldLabel htmlFor="switch-theme-mode">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>黑暗模式</FieldTitle>
            <FieldDescription>
              控制网页的整体色调，有亮色/暗色两种模式可选。选择“跟随系统”会根据浏览器的设置自动切换。
            </FieldDescription>
          </FieldContent>
          {/* <Switch id="switch-share" /> */}
          <ThemeButtonGroups />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="switch-gray-mode">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>灰度模式</FieldTitle>
            <FieldDescription>
              将网页的颜色转换为灰度，适合色弱用户或需要专注内容时使用。
            </FieldDescription>
          </FieldContent>
          {/* <Switch id="switch-gray-mode" /> */}
          <GraySwitcher id="switch-gray-mode" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="switch-notifications">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>色弱模式</FieldTitle>
            <FieldDescription>
              控制网页的颜色显示，适合色弱用户使用。
            </FieldDescription>
          </FieldContent>
          <WeakSwitcher id="switch-notifications" />
        </Field>
      </FieldLabel>
    </FieldGroup>
  )
}
