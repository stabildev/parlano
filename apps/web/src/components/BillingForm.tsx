'use client'

import { trpc } from '../app/_trpc/client'
import MaxWidthWrapper from './MaxWidthWrapper'
import { Button } from './ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import { useToast } from './ui/use-toast'
import { getUserSubscriptionPlan } from '../lib/stripe'
import { format } from 'date-fns'
import { Loader2Icon } from 'lucide-react'

const BillingForm = ({
  subscriptionPlan,
}: {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}) => {
  const { toast } = useToast()

  const { mutate: createStripeSession, isPending } =
    trpc.createStripeSession.useMutation({
      onSuccess: ({ url }) => {
        if (url) {
          window.location.href = url
        } else {
          toast({
            title: 'There was a problem',
            description: 'Please try again later.',
            variant: 'destructive',
          })
        }
      },
      onError: (err) => {
        toast({
          title: 'There was a problem',
          description: err.message,
          variant: 'destructive',
        })
      },
    })

  return (
    <MaxWidthWrapper className="max-w-5xl">
      <form
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault()
          createStripeSession()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the <strong>{subscriptionPlan.name}</strong>{' '}
              plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit" variant="outline">
              {isPending ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {subscriptionPlan.isSubscribed
                ? 'Manage Subscription'
                : 'Upgrade to Pro'}
            </Button>

            {subscriptionPlan.isSubscribed ? (
              <p className="rounded-full text-xs font-medium opacity-70">
                {subscriptionPlan.isCanceled
                  ? 'Your plan will be canceled on '
                  : 'Your plan renews on '}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, 'dd.MM.yyyy')}
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  )
}

export default BillingForm
