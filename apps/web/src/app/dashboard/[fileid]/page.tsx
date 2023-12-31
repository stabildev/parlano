import { ChatTabs } from './ChatTabs'
import ChatWrapper from '../../../components/chat/ChatWrapper'
import PdfRenderer from '../../../components/PdfRenderer'
import { db } from '../../../db'
import { auth, RedirectToSignIn } from '@clerk/nextjs'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: {
    fileid: string
  }
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = params

  const { userId } = auth()

  if (!userId) {
    return <RedirectToSignIn />
  }

  const file = await db.file.findUnique({
    where: {
      id: fileid,
      userId,
    },
  })

  if (!file) {
    notFound()
  }

  return (
    <>
      <ChatTabs file={file} />
      <div className="max-w-8xl mx-auto hidden h-[calc(100vh-3.5rem-1.5rem)] w-full flex-grow flex-row justify-between overflow-hidden border-b bg-zinc-50 dark:bg-transparent lg:flex xl:px-2">
        {/* left side */}
        <div className="flex-1 p-6">
          <PdfRenderer url={file.url} />
        </div>

        {/* right side */}
        <div className="flex max-h-full w-96 flex-[0.75] shrink-0 overflow-hidden border-l border-zinc-200 dark:border-zinc-800">
          <ChatWrapper fileId={file.id} />
        </div>
      </div>
    </>
  )
}

export default Page
