import { trpc } from '@/app/_trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { useMutation } from '@tanstack/react-query'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { ChangeEvent, createContext, useState } from 'react'

type StreamResponse = {
  addMessage: () => void
  message: string
  handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: '',
  handleInputChange: () => {},
  isLoading: false,
})

export const ChatContextProvider = ({
  fileId,
  children,
}: {
  fileId: string
  children: React.ReactNode
}) => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  const utils = trpc.useUtils()

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const cookies = document.cookie

      const authCookies = ['__session', '__clerk_db_jwt', '__client_uat']

      const cookieString = cookies
        .split(';')
        .map((c) => c.trim().split('='))
        .filter(([key]) => authCookies.includes(key))
        .map(([key, value]) => `${key}=${value}`)
        .join('; ')

      if (!process.env.NEXT_PUBLIC_CLOUDWORKER_URL) {
        throw new Error('Missing NEXT_PUBLIC_CLOUDWORKER_URL env variable')
      }

      const cloudWorkerUrl = process.env.NEXT_PUBLIC_CLOUDWORKER_URL

      const response = await fetch(cloudWorkerUrl, {
        method: 'POST',
        body: JSON.stringify({ fileId, message, cookieString }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const openAIStream = OpenAIStream(response)
      const streamResponse = new StreamingTextResponse(openAIStream)

      return streamResponse.body
    },
    onMutate: async ({ message }) => {
      // back up the message for restoration in case of error
      const backupMessage = message

      // clear the message input
      setMessage('')

      // back up the message history for restoration in case of error
      const backupHistory =
        utils.getFileMessages
          .getInfiniteData()
          ?.pages.flatMap((page) => page.messages) ?? []

      // cancel ongoing queries
      await utils.getFileMessages.cancel()

      // optimistic update
      const newMessage = {
        createdAt: new Date().toISOString(),
        id: crypto.randomUUID(),
        text: message,
        isUserMessage: true,
      }

      // add the new message to the top of the first page
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (data) => {
          if (!data) {
            return {
              pages: [],
              pageParams: [],
            }
          }

          return {
            ...data,
            pages: data.pages.map((page, index) => ({
              ...page,
              messages: [
                ...(index === 0 ? [newMessage] : []),
                ...page.messages,
              ],
            })),
          }
        }
      )

      // set loading state
      setIsLoading(true)

      // add backup message and history to context
      return { backupMessage, backupHistory }
    },
    onSuccess: async (stream) => {
      setIsLoading(false)

      if (!stream) {
        return toast({
          title: 'There was a problem sending this message',
          description: 'Please refresh this page and try again',
          variant: 'destructive',
        })
      }

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let done = false

      // accumulated response
      let accResponse = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()

        if (doneReading) {
          done = true
        }

        const chunk = decoder.decode(value)
        accResponse += chunk

        // append chunk to the actual message
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          (data) => {
            if (!data) {
              return {
                pages: [],
                pageParams: [],
              }
            }

            // check if the ai response message has already been created
            const isAiResponseCreated = data.pages.some((page) =>
              page.messages.some((message) => message.id === 'ai-response')
            )

            const pages = isAiResponseCreated
              ? // if the ai response message has already been created, update its text
                data.pages.map((page) => ({
                  ...page,
                  messages: page.messages.map((message) => {
                    if (message.id === 'ai-response') {
                      return {
                        ...message,
                        text: accResponse,
                      }
                    }
                    return message
                  }),
                }))
              : // otherwise, create the ai response message
                data.pages.map((page, index) => ({
                  ...page,
                  messages: [
                    ...(index === 0
                      ? [
                          {
                            createdAt: new Date().toISOString(),
                            id: 'ai-response',
                            text: accResponse,
                            isUserMessage: false,
                          },
                        ]
                      : []),
                    ...page.messages,
                  ],
                }))

            return {
              ...data,
              pages,
            }
          }
        )
      }
    },
    onError: (_, __, context) => {
      setMessage(context?.backupMessage ?? '')
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.backupHistory ?? [] }
      )
    },
    onSettled: async () => {
      setIsLoading(false)

      // invalidate the query to refetch the data
      // timeout is needed to prevent the query from being invalidated before the data is updated
      setTimeout(() => utils.getFileMessages.invalidate({ fileId }), 1000)
    },
  })

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value)
  }

  const addMessage = () => sendMessage({ message })

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
