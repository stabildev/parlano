import { ChatTabs } from '@/app/dashboard/[fileid]/ChatTabs'
import ChatWrapper from '@/components/chat/ChatWrapper'
import PdfRenderer from '@/components/PdfRenderer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: {
    fileid: string
  }
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = params

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    redirect(`/auth-callback?origin=dashboard/${fileid}`)
  }

  const file = await db.file.findUnique({
    where: {
      id: fileid,
      userId: user.id,
    },
  })

  if (!file) {
    notFound()
  }

  return (
    <>
      <ChatTabs file={file} />
      <div className="max-w-8xl max-container-height mx-auto hidden w-full flex-grow flex-row justify-between overflow-hidden lg:flex xl:px-2">
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
