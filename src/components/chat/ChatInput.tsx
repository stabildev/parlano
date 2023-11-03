import { ChatContext } from '@/components/chat/ChatContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SendIcon } from 'lucide-react'
import { useContext, useRef } from 'react'

const ChatInput = ({ disabled }: { disabled?: boolean }) => {
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <form className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex w-full flex-grow flex-col p-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Enter your question…"
                autoFocus
                disabled={disabled}
                rows={1}
                maxRows={4}
                onChange={handleInputChange}
                value={message}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
                    e.preventDefault()
                    addMessage()
                    textareaRef.current?.focus()
                  }
                }}
                className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-bluelighter scrollbar-w-2 scrolling-touch resize-none py-3 pr-12 text-base"
              />

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  addMessage()
                  textareaRef.current?.focus()
                }}
                aria-label="send message"
                disabled={disabled || isLoading}
                className="absolute bottom-1.5 right-[8px]"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ChatInput
