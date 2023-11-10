import { db } from '@/db'
import { receiveMessageValidator } from '@/lib/validators/ReceiveMessageValidator'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export const POST = async (req: Request) => {
  // check if request comes from cloud worker
  // Authorization: Bearer <secret>
  const headers = req.headers
  const bearer = headers.get('Authorization')

  if (!bearer) {
    return new Response('Unauthorized', { status: 401 })
  }

  const secret = bearer.replace('Bearer ', '')

  if (!secret || secret !== process.env.PARLANO_CLOUDWORKER_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Authorize user
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  const userId = user?.id

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  // get complete message and file id
  const body = await req.json()

  const { fileId, message } = receiveMessageValidator.parse(body)

  if (!fileId || !message) {
    return new Response('Bad request', { status: 400 })
  }

  // create db message
  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId: userId,
      fileId,
    },
  })

  return new Response('OK', { status: 200 })
}