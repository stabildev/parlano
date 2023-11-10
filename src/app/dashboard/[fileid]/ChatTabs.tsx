'use client'

import PdfRenderer from '@/components/PdfRenderer'
import ChatWrapper from '@/components/chat/ChatWrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { type File } from '@prisma/client'
import { useState } from 'react'

export const ChatTabs = ({ file }: { file: File }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'pdf'>('chat')
  return (
    <Tabs
      defaultValue="chat"
      className="flex max-h-[calc(100vh-3.5rem-1.5rem)] flex-grow flex-col pt-3 lg:hidden"
      onValueChange={(value) => setActiveTab(value as any)}
    >
      <TabsList className="mx-3 grid w-[calc(100%-1.5rem)] grid-cols-2">
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="pdf">PDF</TabsTrigger>
      </TabsList>
      <TabsContent
        value="chat"
        forceMount
        className={cn(
          'flex max-h-full flex-grow flex-col overflow-hidden',
          activeTab !== 'chat' ? 'hidden' : ''
        )}
      >
        <ChatWrapper fileId={file.id} />
      </TabsContent>
      <TabsContent
        value="pdf"
        forceMount
        className={cn(
          'flex max-h-full p-3',
          activeTab !== 'pdf' ? 'hidden' : ''
        )}
      >
        <PdfRenderer url={file.url} />
      </TabsContent>
    </Tabs>
  )
}
