import type { BasicFormRefDef } from './BasicForm'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import BasicFormCmp from './BasicForm'

function BasicForm() {
  const ref = useRef<BasicFormRefDef>(null)
  const handleReset = useCallback(() => {
    ref.current?.reset()
  }, [])
  const handleConfirm = useCallback(() => {
    const formData = ref.current?.getFormData()
    if (formData) {
      toast(
        <div>
          <span>提交的数据：</span>
          <div>
            {
              Object.entries(formData).map(([key, value]) => {
                return (
                  <div key={key} className="flex items-center gap-1">
                    <p>{`${key}: `}</p>
                    <p className="font-bold">{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</p>
                  </div>
                )
              })
            }
          </div>
        </div>,
        {
          position: 'top-right',
        },
      )
      // 进行后续操作，如网络提交。。。
    }
  }, [])
  return (
    <Card className="size-full">
      <CardHeader>
        <CardTitle>基础表单</CardTitle>
      </CardHeader>
      <ScrollArea className="overflow-y-auto">
        <CardContent>
          <BasicFormCmp ref={ref}></BasicFormCmp>
        </CardContent>
      </ScrollArea>
      <CardFooter className="space-x-4">
        <Button type="reset" variant="outline" onClick={handleReset}>
          重置
        </Button>
        <Button onClick={handleConfirm}>提交</Button>
      </CardFooter>
    </Card>
  )
}

export default BasicForm
