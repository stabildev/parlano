'use client'

import { Footer } from '@/components/Footer'
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
      className="max-container-height fixed inset-0 top-14 flex flex-col pt-3 lg:hidden"
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
        <Footer />
      </TabsContent>
      <TabsContent
        value="pdf"
        forceMount
        className={cn(
          'flex max-h-full flex-col justify-between p-3',
          activeTab !== 'pdf' ? 'hidden' : ''
        )}
      >
        <PdfRenderer url={file.url} />
        <Footer />
      </TabsContent>
    </Tabs>
  )
}
