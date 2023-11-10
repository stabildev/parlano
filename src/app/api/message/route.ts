import { db } from '@/db'
import { pinecone } from '@/lib/pinecone'
import { sendMessageValidator } from '@/lib/validators/SendMessageValidator'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { NextRequest } from 'next/server'

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

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

  const messages = [
    {
      role: 'system',
      content:
        'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
    },
    {
      role: 'user',
      content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
      
\n----------------\n

PREVIOUS CONVERSATION:
${prevMessages.map((message) =>
  message.isUserMessage ? `User: ${message.text}` : `Assistant: ${message.text}`
)}).join('\n\n')}

\n----------------\n

CONTEXT:
${results.map((r) => r.pageContent).join('\n\n')}

USER INPUT: ${message}`,
    },
  ]

  return Response.json({ messages })
}
