import type { BasicFormRefDef } from './BasicForm'
import { useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { ScrollArea } from '@/components/ui/scroll-area'
import BasicFormCmp from './BasicForm'

function BasicForm() {
  const ref = useRef<BasicFormRefDef>(null)
  const handleReset = () => {
    if (ref.current) {
      ref.current.reset()
    }
  }
  const handleConfirm = async () => {
    if (ref.current) {
      const formData = await ref.current.getFormData()
      if (formData) {
        toast(
          <div>
            <span>提交的数据：</span>
            <div>
              {
                Object.entries(formData).map(([key, value]) => {
                  return (
                    <p key={key}>
                      {key}
                      :
                      {' '}
                      {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                    </p>
                  )
                })
              }
            </div>
          </div>,
          {
            position: 'top-right',
          },
        )
      }
    }
  }
  return (
    <Card className="size-full flex flex-col">
      <CardHeader className="min-h-12">
        <CardTitle>活动申请</CardTitle>
        <CardDescription>
          创建，申请活动
        </CardDescription>
      </CardHeader>
      <ScrollArea className="max-h-[calc(100%-8rem)]">

        <CardContent className="flex-1">
          <BasicFormCmp id="basicForm" ref={ref} />
        </CardContent>
      </ScrollArea>
      <CardFooter className="min-h-8">
        <Field orientation="horizontal" className="flex items-center justify-end">
          <Button type="button" variant="outline" onClick={handleReset}>
            重置
          </Button>
          <Button type="submit" form="form-rhf-demo" onClick={handleConfirm}>
            提交
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}

export default BasicForm
