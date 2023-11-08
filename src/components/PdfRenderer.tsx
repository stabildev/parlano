'use client'

import { useToast } from '@/components/ui/use-toast'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
  RotateCwIcon,
  SearchIcon,
} from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useResizeDetector } from 'react-resize-detector'
import SimpleBar from 'simplebar-react'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PdfFullScreen from '@/components/PdfFullScreen'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfRendererProps {
  url: string
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast()

  const { width, ref } = useResizeDetector()

  const [pageCount, setPageCount] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [renderedScale, setRenderedScale] = useState<number | null>(null)

  const isLoading = renderedScale !== scale

  const customPageValidator = z.object({
    page: z
      .string()
      .refine((value) => Number(value) > 0 && Number(value) <= pageCount),
  })

  type CustomPageValidator = z.infer<typeof customPageValidator>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CustomPageValidator>({
    defaultValues: {
      page: '1',
    },
    resolver: zodResolver(customPageValidator),
  })

  const onSubmit = ({ page }: CustomPageValidator) => {
    setCurrentPage(Number(page))
    setValue('page', String(page))
  }

  return (
    <div className="flex w-full flex-col items-center rounded-md bg-white shadow dark:border dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-zinc-20 flex h-14 w-full items-center justify-between border-b px-2 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => {
              setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1))
              setValue('page', String(currentPage - 1))
            }}
          >
            <ChevronUpIcon className="h-4 w-4" />
          </Button>

          <div className="5 flex items-center gap-1">
            <Input
              {...register('page')}
              className={cn(
                'h-8 w-12 text-center',
                errors.page && 'focus-visible:ring-red-500'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(onSubmit)()
                }
              }}
            />
            <p className="text-sm text-zinc-700">
              <span className="mx-2">/</span>
              <span>{pageCount}</span>
            </p>
          </div>

          <Button
            variant="ghost"
            aria-label="Next page"
            disabled={currentPage >= pageCount}
            onClick={() => {
              const newValue = setCurrentPage((prev) =>
                prev < pageCount ? prev + 1 : pageCount
              )
              setValue('page', String(currentPage + 1))
            }}
          >
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="zoom"
              className={buttonVariants({
                variant: 'ghost',
                className: 'gap-1.5',
              })}
            >
              <SearchIcon className="h-4 w-4" />
              {scale * 100}%
              <ChevronDownIcon className="h-3 w-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            aria-label="rotate 90 degrees"
            onClick={() => setRotation((prev) => prev + 90)}
          >
            <RotateCwIcon className="h-4 w-4" />
          </Button>

          <PdfFullScreen fileUrl={url} />
        </div>
      </div>

      <div className="max-h-screen w-full flex-1">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              file={url}
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
              {isLoading && renderedScale ? (
                <Page
                  width={width || 1}
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  key={'@' + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? 'hidden' : '')}
                width={width || 1}
                pageNumber={currentPage}
                scale={scale}
                rotate={rotation}
                key={'@' + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2Icon className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => {
                  setRenderedScale(scale)
                }}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  )
}

export default PdfRenderer
