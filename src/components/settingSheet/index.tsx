import { LayoutTemplateIcon, PaletteIcon, PencilIcon, SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '../ui/scroll-area'
import LayoutTabContent from './layoutTabContent'
import OtherTabContent from './OtherTabContent'
import ThemeTabContent from './ThemeTabContent'

export default function SettingSheet() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  return (
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
          <p>{t('settings.title')}</p>
        </TooltipContent>
      </Tooltip>

      <SheetContent
        side="right"
        onCloseAutoFocus={e => e.preventDefault()}
        // onInteractOutside={e => e.preventDefault()} // 阻止交互关闭
        className="size-full max-w-md"
      >
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
              <TabsTrigger value="theme" className='data-[state="active"]:bg-primary/20!'>
                <PaletteIcon />
                {t('settings.theme')}
              </TabsTrigger>
              <TabsTrigger value="layout" className='data-[state="active"]:bg-primary/20!'>
                <LayoutTemplateIcon />
                {t('settings.layout')}
              </TabsTrigger>
              <TabsTrigger value="other" className='data-[state="active"]:bg-primary/20!'>
                <PencilIcon />
                {t('settings.other')}
              </TabsTrigger>
            </TabsList>

            {/* Tab 内容区 - 自动占满剩余高度并支持滚动 */}
            <TabsContent value="theme" className="size-full overflow-hidden">
              <ScrollArea className="size-full max-h-[calc(100vh-10rem)]  px-4 py-2">
                <ThemeTabContent />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="layout" className="size-full overflow-hidden">
              <ScrollArea className="size-full max-h-[calc(100vh-10rem)]  px-4 py-2">

                {/* 这里放布局设置内容 */}
                <LayoutTabContent />
              </ScrollArea>

            </TabsContent>

            <TabsContent value="other" className="size-full overflow-hidden">
              <ScrollArea className="size-full max-h-[calc(100vh-10rem)]  px-4 py-2">

                <OtherTabContent />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
