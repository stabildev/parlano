import { db } from '@/db'
import { pinecone } from '@/lib/pinecone'
import { buildPrompt } from '@/lib/prompt'
import { sendMessageValidator } from '@/lib/validators/SendMessageValidator'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { NextRequest } from 'next/server'
import { clerkClient } from '@clerk/nextjs'

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

  const { fileId, message } = sendMessageValidator.parse(body)

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file) {
    return new Response('Not found', { status: 404 })
  }

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  })

  // 1) vectorize message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  const pineconeIndex = pinecone.Index('parlano')

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    filter: {
      fileId,
    },
  })

  const results = await vectorStore.similaritySearch(message, 4)

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  })

  const messages = buildPrompt({
    message,
    previousMessages: prevMessages,
    context: results.map((result) => result.pageContent),
  })

  return Response.json({ messages })
}
