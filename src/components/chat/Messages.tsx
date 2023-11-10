import { trpc } from '@/app/_trpc/client'
import { ChatContext } from '@/components/chat/ChatContext'
import Message from '@/components/chat/Message'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { Loader2Icon, MessageSquareIcon } from 'lucide-react'
import { useContext, useEffect, useRef } from 'react'
import { useIntersection } from '@mantine/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { keepPreviousData } from '@tanstack/react-query'

const Messages = ({ fileId }: { fileId: string }) => {
  const { isLoading: isAiThinking } = useContext(ChatContext)

  const { data, isPending, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        placeholderData: keepPreviousData,
      }
    )
  const messages = data?.pages.flatMap((page) => page.messages) ?? []

  const loadingMessage = {
    id: 'loading',
    isUserMessage: false,
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2Icon className="h-4 w-4 animate-spin" />
      </span>
    ),
  }

  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...messages,
  ]

  const lastMessageRef = useRef<HTMLDivElement>(null)

  const { ref, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  })

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage()
    }
  }, [entry, fetchNextPage])

  return (
    // max-h-[calc(var(--viewport-height)-3.5rem-7rem)] flex-1
    <div className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex flex-col-reverse gap-4 overflow-y-auto border-zinc-200 p-3">
      {combinedMessages.length ? (
        combinedMessages.map((message, i) => {
          const isNextMessageSameUser =
            combinedMessages[i - 1]?.isUserMessage === message.isUserMessage

          if (i === combinedMessages.length - 1) {
            return (
              <Message
                ref={ref}
                message={message}
                isNextMessageSamePerson={isNextMessageSameUser}
                key={message.id}
              />
            )
          } else {
            return (
              <Message
                message={message}
                isNextMessageSamePerson={isNextMessageSameUser}
                key={message.id}
              />
            )
          }
        })
      ) : isPending ? (
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <MessageSquareIcon className="h-8 w-8 text-blue-500" />
          <h3 className="text-xl font-semibold">You&apos;re all set!</h3>
          <p className="text-sm text-zinc-500">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default Messages
