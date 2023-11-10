'use client'

import { buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ExpandIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import SimpleBar from 'simplebar-react'
import { Document, Page } from 'react-pdf'
import { useToast } from '@/components/ui/use-toast'
import { useResizeDetector } from 'react-resize-detector'

interface PdfFullScreenProps {
  fileUrl: string
}

const PdfFullScreen = ({ fileUrl }: PdfFullScreenProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [pageCount, setPageCount] = useState(1)

  const { width, ref } = useResizeDetector()
  const { toast } = useToast()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        className={buttonVariants({
          variant: 'ghost',
          className: 'gap-1.5 px-2 sm:px-4',
        })}
        aria-label="full screen"
      >
        <ExpandIcon className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="w-full max-w-7xl dark:border-zinc-800">
        <SimpleBar autoHide={false} className="mt-6 max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              file={fileUrl}
              className="max-h-full"
              loading={
                <div className="flex justify-center">
                  <Loader2Icon className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: 'Error',
                  description: 'Please try again later',
                  variant: 'destructive',
                })
              }}
              onLoadSuccess={({ numPages }) => {
                setPageCount(numPages)
              }}
            >
              {new Array(pageCount).fill(0).map((_, index) => (
                <Page key={index} width={width || 1} pageNumber={index + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  )
}

export default PdfFullScreen
