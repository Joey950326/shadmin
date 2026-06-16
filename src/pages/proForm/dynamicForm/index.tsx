import type { DynamicFormRefDef } from './DynamicForm'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import DynamicFormCmp from './DynamicForm'

function DynamicForm() {
  const ref = useRef<DynamicFormRefDef>(null)
  const handleReset = useCallback(() => {
    ref.current?.reset()
  }, [])
  const handleConfirm = useCallback(async () => {
    const formData = await ref.current?.getFormData()
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
    else {
      toast.error('表单校验不通过', {
        position: 'top-right',
      })
    }
  }, [])
  return (
    <Card className="size-full">
      <CardHeader>
        <CardTitle>基础表单</CardTitle>
      </CardHeader>
      <ScrollArea className="overflow-y-auto">
        <CardContent>
          <DynamicFormCmp ref={ref}></DynamicFormCmp>
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

export default DynamicForm
