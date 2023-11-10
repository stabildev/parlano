'use client'

import { trpc } from '@/app/_trpc/client'
import UploadButton from '@/components/UploadButton'
import {
  GhostIcon,
  Loader2Icon,
  MessageSquareIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'

const Dashboard = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const [deletingFile, setDeletingFile] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const { data: files, isPending } = trpc.getUserFiles.useQuery()

  const { toast } = useToast()

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate()
    },
    onError: (err) => {
      toast({
        title: 'Error deleting file',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    },
    onMutate: ({ id }) => {
      setDeletingFile(id)
    },
    onSettled: () => {
      setDeletingFile(null)
    },
  })

  return (
    <main className="mx-auto w-full max-w-7xl px-4 md:p-10">
      <div className="flex flex-row items-center justify-between gap-4 border-b border-gray-200 py-8 dark:border-zinc-800 sm:gap-0">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-200 sm:text-5xl">
          My Files
        </h1>

        <UploadButton isSubscribed={isSubscribed} />
      </div>

      {/* display all user files */}
      {files && files.length ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg dark:divide-zinc-800 dark:border dark:border-zinc-800/50 dark:bg-zinc-900/50"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="flex w-full items-center justify-between space-x-6 px-6 pt-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-violet-500 to-rose-600 dark:opacity-80" />
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900 dark:text-zinc-200">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="mt-4 grid grid-cols-3 place-items-center gap-6 px-4 py-2 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    {format(new Date(file.createdAt), 'MMM yyyy')}
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageSquareIcon className="h-4 w-4" />
                    {file._count.messages}
                  </div>

                  <Button
                    onClick={() => deleteFile({ id: file.id })}
                    size="sm"
                    variant="ghost"
                    className="w-full hover:text-destructive"
                  >
                    {deletingFile === file.id ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isPending ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="my-2 h-36" />
          <Skeleton className="my-2 h-36" />
          <Skeleton className="my-2 h-36" />
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <GhostIcon className="h-8 w-8 text-zinc-800 dark:text-zinc-600" />
          <h3 className="text-xl font-semibold">Pretty empty around here</h3>
          <p className="dark:text-zinc-500">
            Let&apos;s upload your first PDF.
          </p>
        </div>
      )}
    </main>
  )
}

export default Dashboard
