import type { BasicFormRefDef } from './ComplexForm'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { ScrollArea } from '@/components/ui/scroll-area'
import BasicFormCmp from './ComplexForm'

function ComplexForm() {
  const { t } = useTranslation()
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
            <span>{t('form.submittedData')}</span>
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
      }
    }
  }
  return (
    <Card className="size-full">
      <CardHeader>
        <CardTitle>{t('form.activityApplicationTitle')}</CardTitle>
        <CardDescription>
          {t('form.activityApplicationDescription')}
        </CardDescription>
      </CardHeader>
      <ScrollArea className="overflow-y-auto">
        <CardContent className="flex-1">
          <BasicFormCmp id="basicForm" ref={ref} />
        </CardContent>
      </ScrollArea>
      <CardFooter>
        <Field orientation="horizontal" className="flex items-center justify-end">
          <Button type="button" variant="outline" onClick={handleReset}>
            {t('reset')}
          </Button>
          <Button type="submit" form="form-rhf-demo" onClick={handleConfirm}>
            {t('submit')}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}

export default ComplexForm
