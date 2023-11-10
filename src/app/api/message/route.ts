import { db } from '@/db'
import { pinecone } from '@/lib/pinecone'
import { buildPrompt } from '@/lib/prompt'
import { sendMessageValidator } from '@/lib/validators/SendMessageValidator'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
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

  const { getUser } = getKindeServerSession()
  const user = await getUser()
  const userId = user?.id

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
