'use client'

import { trpc } from '@/trpc/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { useUploadThing } from '@/lib/uploadthing'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { CloudIcon, FileIcon, Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Dropzone from 'react-dropzone'
import { HoverShine } from '@/components/HoverShine'
import { cn } from '@/lib/utils'

const UploadDropzone = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const router = useRouter()

  const { toast } = useToast()

  const { startUpload } = useUploadThing(
    isSubscribed ? 'proPlanUploader' : 'freePlanUploader'
  )

  const startSimulatedProgress = () => {
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 500)

    return interval
  }

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`)
    },
    retry: true,
    retryDelay: 500,
  })

  return (
    <Dropzone
      multiple={false}
      onDragEnter={() => setIsHovering(true)}
      onDragLeave={() => setIsHovering(false)}
      onDrop={async (acceptedFile) => {
        setIsHovering(false)
        setIsUploading(true)
        const progressInterval = startSimulatedProgress()

        // handle file uploading
        const res = await startUpload(acceptedFile)

        if (!res) {
          return toast({
            title: 'Something went wrong',
            description: 'Please try again later',
            variant: 'destructive',
          })
        }

        const [fileResponse] = res
        const key = fileResponse?.key

        if (!key) {
          return toast({
            title: 'Something went wrong',
            description: 'Please try again later',
            variant: 'destructive',
          })
        }

        startPolling({ key })

        clearInterval(progressInterval)
        setUploadProgress(100)
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className={cn(
            'm-4 h-64 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 dark:border-2 dark:border-zinc-800 dark:bg-zinc-900/25',
            isHovering && 'bg-zinc-100 dark:bg-zinc-900'
          )}
        >
          <div className="flex h-full w-full items-center justify-center">
            <label
              htmlFor="dropzone-file"
              className={cn(
                'flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg'
              )}
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <CloudIcon className="mb-2 h-6 w-6 text-zinc-500" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500">
                  PDF (up to {isSubscribed ? '16' : '4'}MB)
                </p>
              </div>

              {acceptedFiles && acceptedFiles.length ? (
                <div className="flex max-w-xs items-center divide-x divide-zinc-200 overflow-hidden rounded-md bg-white outline outline-[1px] outline-zinc-200 dark:divide-zinc-700 dark:bg-zinc-900 dark:outline-zinc-700">
                  <div className="grid h-full place-items-center px-3 py-2">
                    <FileIcon className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="h-full truncate px-3 py-2 text-sm dark:text-zinc-300">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="mx-auto mt-4 w-full max-w-xs">
                  <Progress
                    indicatorColor={
                      uploadProgress === 100 ? 'bg-green-500' : ''
                    }
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex items-center justify-center gap-1 pt-2 text-center text-sm text-zinc-700">
                      <Loader2Icon className="h-3 w-3 animate-spin" />
                      Redirecting…
                    </div>
                  ) : null}
                </div>
              ) : null}

              <input
                type="file"
                className="hidden"
                {...getInputProps()}
                id="dropzone-file"
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  )
}

const UploadButton = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <HoverShine>
          <Button
            className="bg-gradient-to-r from-purple-600 to-rose-600 shadow"
            onClick={() => setIsOpen(true)}
          >
            Upload PDF
          </Button>
        </HoverShine>
      </DialogTrigger>

      <DialogContent className="dark:border-neutral-800">
        <UploadDropzone isSubscribed={isSubscribed} />
      </DialogContent>
    </Dialog>
  )
}

export default UploadButton
