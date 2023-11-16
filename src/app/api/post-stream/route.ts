import { db } from '@/db'
import { receiveMessageValidator } from '@/lib/validators/ReceiveMessageValidator'
import { clerkClient } from '@clerk/nextjs'
import { NextRequest } from 'next/server'

export const POST = async (req: NextRequest) => {
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

  const body = await req.json()

  // Authenticate user
  const { sessionId, token } = body

  console.log('sessionId', sessionId)
  console.log('token', token)

  if (!sessionId || !token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const session = await clerkClient.sessions.verifySession(sessionId, token)
  const userId = session?.userId
  console.log('userId', userId)

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  // get complete message and file id

  const { fileId, message } = receiveMessageValidator.parse(body)

  if (!fileId || !message) {
    return new Response('Bad request', { status: 400 })
  }

  // create db message
  await db.message.create({
    data: {
      text: message,
      isUserMessage: false,
      userId: userId,
      fileId,
    },
  })

  return new Response('OK', { status: 200 })
}
