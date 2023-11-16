import { z } from 'zod'

export const receiveMessageValidator = z.object({
  fileId: z.string(),
  message: z.string().trim(),
})

export type ReceiveMessageValidator = z.infer<typeof receiveMessageValidator>
