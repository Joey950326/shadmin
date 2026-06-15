import * as z from 'zod'

export const ActivityZoneValue = ['zone one', 'zone two']

export const formSchema = z.object({
  activityName: z.string().min(1, '活动名称不能为空').max(20, '活动名称字数不超过20'),
  activityZone: z.enum(ActivityZoneValue, '活动范围必填'),
  activityTime: z.date('请输入有效时间戳').refine(date => date.getTime() >= Date.now(), '活动时间必须晚于当前时间'),
  instantDelivery: z.boolean('必须为布尔值'),
  activityType: z.array(z.string().min(1, '活动类型字数不能为空')
    .max(20, '活动类型字数不超过20个')).min(1, '活动类型必填'),
  resource: z.array(z.string().min(1, '活动资源字数不能为空')
    .max(20, '活动来源字数不超过20个')).min(1, '活动资源必填'),
  activityDescription: z.string().max(100, '活动描述字数不超过20个').optional(),
}).refine((data) => {
  if (data.activityType.includes('online') && !data.resource.includes('venue')) {
    return false
  }
  return true
}, { message: '在线活动必须勾选场地', path: ['resource'] }).refine((data) => {
  if (data.activityType.includes('promotion') && !data.resource.includes('sponsor')) {
    return false
  }
  return true
}, { message: '促销活动必须选择赞助', path: ['resource'] })

export type FormDataType = z.infer<typeof formSchema>
