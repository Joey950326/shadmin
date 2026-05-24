import { LayoutTemplateIcon, PaletteIcon, PencilIcon, SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '../ui/scroll-area'
import LayoutTabContent from './LayoutTabContent'
import OtherTabContent from './OtherTabContent'
import ThemeTabContent from './ThemeTabContent'

export default function SettingSheet() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  return (
    <TooltipProvider>
      <Sheet open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <SettingsIcon />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>设置</p>
          </TooltipContent>
        </Tooltip>

        <SheetContent side="right" onCloseAutoFocus={e => e.preventDefault()} className="size-full max-w-md">
          <SheetHeader className="h-24">
            <SheetTitle>{t('header:customSetting')}</SheetTitle>
            <SheetDescription>
              {t('header:customSettingDesc')}
            </SheetDescription>
          </SheetHeader>

          <div className="size-full">
            {/* 外层必须有高度 */}
            <Tabs defaultValue="theme" className="size-full">
              {/* Tab 标题栏 - 固定高度 */}
              <TabsList className="w-[90%] mx-auto h-8">
                <TabsTrigger value="theme">
                  <PaletteIcon />
                  主题设置
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <LayoutTemplateIcon />
                  布局设置
                </TabsTrigger>
                <TabsTrigger value="other">
                  <PencilIcon />
                  其他设置
                </TabsTrigger>
              </TabsList>

              {/* Tab 内容区 - 自动占满剩余高度并支持滚动 */}
              <TabsContent value="theme" className="size-full overflow-hidden">
                <ScrollArea className="size-full max-h-[calc(100vh-10rem)]">
                  <ThemeTabContent />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="layout" className="size-full overflow-hidden">
                <ScrollArea className="size-full max-h-[calc(100vh-10rem)]">

                  {/* 这里放布局设置内容 */}
                  <LayoutTabContent />
                </ScrollArea>

              </TabsContent>

              <TabsContent value="other" className="size-full overflow-hidden">
                <ScrollArea className="size-full max-h-[calc(100vh-10rem)]">

                  <OtherTabContent />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
