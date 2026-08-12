import * as z from 'zod'

export const ActivityZoneValue = ['zone one', 'zone two'] as const

export function createFormSchema(t: (key: string) => string) {
  return z.object({
    activityName: z.string().min(1, t('form.activityNameRequired')).max(20, t('form.activityNameMax')),
    activityZone: z.enum(ActivityZoneValue, t('form.activityZoneRequired')),
    activityTime: z.date(t('form.invalidTimestamp')).refine(date => date.getTime() >= Date.now(), t('form.activityTimeFuture')),
    instantDelivery: z.boolean(t('form.booleanRequired')),
    activityType: z.array(z.string().min(1, t('form.activityTypeItemEmpty'))
      .max(20, t('form.activityTypeItemMax'))).min(1, t('form.activityTypeRequired')),
    resource: z.array(z.string().min(1, t('form.resourceItemEmpty'))
      .max(20, t('form.resourceItemMax'))).min(1, t('form.resourceRequired')),
    activityDescription: z.string().max(100, t('form.activityDescriptionMax')).optional(),
  }).refine((data) => {
    if (data.activityType.includes('online') && !data.resource.includes('venue')) {
      return false
    }
    return true
  }, { message: t('form.onlineRequiresVenue'), path: ['resource'] }).refine((data) => {
    if (data.activityType.includes('promotion') && !data.resource.includes('sponsor')) {
      return false
    }
    return true
  }, { message: t('form.promotionRequiresSponsor'), path: ['resource'] })
}

export type FormDataType = z.infer<ReturnType<typeof createFormSchema>>
