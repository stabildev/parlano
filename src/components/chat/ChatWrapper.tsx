'use client'

import { trpc } from '@/app/_trpc/client'
import { ChatContextProvider } from '@/components/chat/ChatContext'
import ChatInput from '@/components/chat/ChatInput'
import Messages from '@/components/chat/Messages'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft, Loader2Icon, XCircleIcon } from 'lucide-react'
import Link from 'next/link'

const ChatWrapper = ({ fileId }: { fileId: string }) => {
  const { data: status, isLoading } =
    trpc.getFileUploadStatus.useQuery(
      {
        fileId,
      },
      {
        refetchInterval: (status) =>
          status === 'SUCCESS' || status === 'FAILED' ? false : 500,
      }
    )

  if (isLoading) {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 mt-6 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2Icon className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-xl font-semibold">Loading…</h3>
            <p className="text-sm text-zinc-500">
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>
        <ChatInput disabled />
      </div>
    )
  }

  if (status === 'PROCESSING') {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 mt-6 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2Icon className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-xl font-semibold">Processing PDF…</h3>
            <p className="text-sm text-zinc-500">
              This won&apos;t take long.
            </p>
          </div>
        </div>
        <ChatInput disabled />
      </div>
    )
  }

  if (status === 'FAILED') {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 mt-6 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <XCircleIcon className="h-8 w-8 text-red-500" />
            <h3 className="text-xl font-semibold">
              Too many pages in PDF
            </h3>
            <p className="text-sm text-zinc-500">
              Your <span className="font-medium">Free</span> plan only
              supports PDFs with up to 5 pages.
            </p>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: 'secondary',
                className: 'mt-4',
              })}
            >
              <ChevronLeft className="mr-1.5 h-3 w-3" />
            </Link>
          </div>
        </div>
        <ChatInput disabled />
      </div>
    )
  }

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col justify-between">
          <Messages fileId={fileId} />
        </div>
        <ChatInput />
      </div>
    </ChatContextProvider>
  )
}

export default ChatWrapper
