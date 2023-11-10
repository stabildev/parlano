'use client'

import { Footer } from '@/components/Footer'
import PdfRenderer from '@/components/PdfRenderer'
import ChatWrapper from '@/components/chat/ChatWrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { type File } from '@prisma/client'
import { useEffect, useState } from 'react'

export const ChatTabs = ({ file }: { file: File }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'pdf'>('chat')

  // to avoid viewport height issues on safari mobile this component is displayed as fixed and background scroll is disabled

  useEffect(() => {
    document.body.classList.add('overflow-hidden')
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [])

  return (
    <Tabs
      defaultValue="chat"
      className="fixed inset-0 top-14 flex flex-col bg-background pt-3 lg:hidden"
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
