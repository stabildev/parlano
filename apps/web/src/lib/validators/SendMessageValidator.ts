import { z } from 'zod'

export const sendMessageValidator = z.object({
  fileId: z.string(),
  message: z.string().min(1).max(1000),
})

export type SendMessageValidator = z.infer<typeof sendMessageValidator>
