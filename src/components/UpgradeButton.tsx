'use client'

import { trpc } from '@/app/_trpc/client'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from 'lucide-react'

const UpgradeButton = () => {
  const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url ?? '/dashboard/billing'
    },
  })
  return (
    <Button
      onClick={() => createStripeSession()}
      className="w-full bg-gradient-to-r from-purple-600 to-rose-500"
    >
      Upgrade now <ArrowRightIcon className="ml-1.5 h-5 w-5" />
    </Button>
  )
}

export default UpgradeButton
