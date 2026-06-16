import * as z from 'zod'

export const formSchema = z.object({
  name: z.string().min(1, 'name is empty no allow').max(20, 'The length of name must less than 20'),
  phones: z
    .array(
      z.object({
        number: z.string().length(11, 'phone number must be 11 char').refine(data => Number(data), '手机号必须为数字组合'),
      }),
    )
    .min(1, 'Add at least one phone number.')
    .max(5, 'You can add up to 5 phone number.'),
  emails: z
    .array(
      z.object({
        address: z.email('Enter a valid email address.'),
      }),
    )
    .min(1, 'Add at least one email address.')
    .max(5, 'You can add up to 5 email addresses.'),
})

export type FormSchemaType = z.infer<typeof formSchema>
