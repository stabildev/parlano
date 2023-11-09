'use client'

import { trpc } from '@/app/_trpc/client'
import { Loader2Icon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const Page = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const origin = searchParams.get('origin')

  const { data, error, status } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500,
  })

  useEffect(() => {
    if (status === 'success' && data?.success) {
      // user is synced to db
      router.push(origin ? `/${origin}` : '/dashboard')
    } else if (status === 'error' && error.data?.code === 'UNAUTHORIZED') {
      router.push('/sign-in')
    }
  }, [data, error, status, router, origin])

  return (
    <div className="mt-24 flex w-full justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2Icon className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="text-xl font-semibold">Setting up your account…</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  )
}

export default Page
