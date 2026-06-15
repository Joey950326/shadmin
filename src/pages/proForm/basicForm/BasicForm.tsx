import type { Ref } from 'react'
import { memo, useCallback, useImperativeHandle, useState } from 'react'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export interface BasicFormType {
  name: string
  email: string
  age: number | string
  gender: 1 | 2 | string
  status: boolean

}

export interface BasicFormRefDef {
  getFormData: () => BasicFormType
  reset: () => void
}

interface BasicFormProps {
  ref: Ref<BasicFormRefDef | null>
  value?: BasicFormType
  onValueChange?: (val: BasicFormType) => void
}

const DEFAULT_FORM_VALUE = {
  name: '',
  email: '',
  age: '',
  gender: '',
  status: true,

}

function BasicFormCmp({ ref, value }: BasicFormProps) {
  const [innerFormData, setInnerFormData] = useState<BasicFormType>(() => ({ ...DEFAULT_FORM_VALUE, ...value }))

  const handleFormChange = useCallback((val: Partial<BasicFormType>) => {
    setInnerFormData(prev => ({ ...prev, ...val }))
  }, [])

  useImperativeHandle(ref, () => ({
    getFormData: () => innerFormData,
    reset: () => {
      setInnerFormData(DEFAULT_FORM_VALUE)
    },
  }))

  return (
    <FieldGroup className="gap-4">
      {/* username */}
      <Field>
        <FieldLabel htmlFor="form-name">用户名</FieldLabel>
        <Input className="max-w-lg" value={innerFormData.name} onChange={e => handleFormChange({ name: e.target.value })} id="form-name" placeholder="请输入用户名" />
      </Field>
      {/* email */}
      <Field>
        <FieldLabel htmlFor="form-email">邮箱</FieldLabel>
        <Input
          id="fomr-email"
          type="email"
          placeholder="请输入邮箱"
          className="max-w-lg"
          value={innerFormData.email}
          onChange={e => handleFormChange({ email: e.target.value })}
        />
        <FieldDescription className="text-muted-foreground italic pl-2 text-xs">
          邮箱必须唯一
        </FieldDescription>
      </Field>
      {/* age */}
      <Field>
        <FieldLabel htmlFor="form-age">年龄</FieldLabel>
        <Input
          placeholder="请输入年龄"
          value={innerFormData.age}
          onChange={e => handleFormChange({ age: Number(e.target.value) })}
          id="form-age"
          type="number"
          className="max-w-32"
        >
        </Input>
      </Field>
      {/* gender */}
      <Field>
        <FieldLabel htmlFor="form-age">性别</FieldLabel>
        <Select value={innerFormData.gender.toString()} onValueChange={val => handleFormChange({ gender: val })}>
          <SelectTrigger className="max-w-48">
            <SelectValue placeholder="请选择性别" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="male">male</SelectItem>
              <SelectItem value="female">female</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      {/* status */}
      <Field>
        <FieldLabel htmlFor="form-status">启用状态</FieldLabel>
        <Switch checked={innerFormData.status} onCheckedChange={val => handleFormChange({ status: val })} disabled></Switch>
        <FieldDescription className="text-xs italic">
          状态默认启动
        </FieldDescription>
      </Field>
    </FieldGroup>

  )
}

export default memo(BasicFormCmp)
