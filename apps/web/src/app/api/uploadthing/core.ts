import { db } from '../../../db'
import { currentUser } from '@clerk/nextjs'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { pinecone } from '../../../lib/pinecone'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { getUserSubscriptionPlan } from '../../../lib/stripe'
import { PLANS } from '../../../config/stripe'

const f = createUploadthing()

const middleware = async () => {
  const user = await currentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const subscriptionPlan = await getUserSubscriptionPlan()

  return { subscriptionPlan, userId: user.id }
}

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>
  file: {
    key: string
    name: string
    url: string
  }
}) => {
  // avoid duplicate uploads

  const existingFile = await db.file.findFirst({
    where: { key: file.key },
  })

  if (existingFile) {
    return
  }

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: `https://uploadthing.com/f/${file.key}`,
      uploadStatus: 'PROCESSING',
    },
  })

  try {
    const response = await fetch(createdFile.url, {
      redirect: 'follow',
    })

    const blob = await response.blob()
    const loader = new PDFLoader(blob)

    const pageLevelDocs = await loader.load()
    pageLevelDocs.forEach((doc, i) => {
      doc.metadata = {
        ...doc.metadata,
        fileId: createdFile.id,
      }
    })

    const pageCount = pageLevelDocs.length
    const { subscriptionPlan } = metadata
    const { isSubscribed } = subscriptionPlan
    const isProExceeded =
      pageCount > PLANS.find((plan) => plan.name === 'Pro')!.pagesPerPdf
    const isFreeExceeded =
      pageCount > PLANS.find((plan) => plan.name === 'Free')!.pagesPerPdf

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      throw new Error('Page limit exceeded')
      // await db.file.update({
      //   where: { id: createdFile.id },
      //   data: {
      //     uploadStatus: 'FAILED',
      //   },
      // })
    }

    // vectorize and index entire document

    const pineconeIndex = pinecone.index('parlano')

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
    })

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      // namespace: createdFile.id,
    })

    await db.file.update({
      where: { id: createdFile.id },
      data: {
        uploadStatus: 'SUCCESS',
      },
    })
  } catch (e) {
    console.error('onUploadComplete: ', e)
    await db.file.update({
      where: { id: createdFile.id },
      data: {
        uploadStatus: 'FAILED',
      },
    })
  }
}

export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: '4MB' } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: '16MB' } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
