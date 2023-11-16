'use client'

import { trpc } from '../../app/_trpc/client'
import { ChatContextProvider } from './ChatContext'
import ChatInput from './ChatInput'
import Messages from './Messages'
import { buttonVariants } from '../ui/button'
import { ChevronLeft, Loader2Icon, XCircleIcon } from 'lucide-react'
import Link from 'next/link'

const ChatWrapper = ({ fileId }: { fileId: string }) => {
  const { data: status, isPending } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: (query) => {
        return query.state.data === 'SUCCESS' || query.state.data === 'FAILED'
          ? false
          : 500
      },
    }
  )

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="flex flex-grow flex-col divide-y divide-zinc-200 overflow-hidden dark:divide-zinc-800 dark:bg-zinc-950 sm:bg-zinc-100/75">
        {isPending ? (
          <div className="flex flex-grow flex-col items-center justify-center gap-2">
            <Loader2Icon className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-xl font-semibold">Loading…</h3>
            <p className="text-sm text-zinc-500">
              We&apos;re preparing your PDF.
            </p>
          </div>
        ) : status === 'PROCESSING' ? (
          <div className="flex flex-grow flex-col items-center justify-center gap-2">
            <Loader2Icon className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-xl font-semibold">Processing PDF…</h3>
            <p className="text-sm text-zinc-500">This won&apos;t take long.</p>
          </div>
        ) : status === 'FAILED' ? (
          <div className="flex flex-grow flex-col items-center justify-center gap-2">
            <XCircleIcon className="h-8 w-8 text-red-500" />
            <h3 className="text-xl font-semibold">Too many pages in PDF</h3>
            <p className="text-sm text-zinc-500">
              Your <span className="font-medium">Free</span> plan only supports
              PDFs with up to 5 pages.
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
        ) : (
          <Messages fileId={fileId} />
        )}
        <div className="relative">
          <ChatInput
            disabled={
              isPending || status === 'PROCESSING' || status === 'FAILED'
            }
          />
        </div>
      </div>
    </ChatContextProvider>
  )
}

export default ChatWrapper
