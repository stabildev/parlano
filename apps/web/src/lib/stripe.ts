import 'server-only'
import { PLANS } from '../config/stripe'
import { currentUser } from '@clerk/nextjs'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
  typescript: true,
})

export async function getUserSubscriptionPlan() {
  const user = await currentUser()

  if (!user?.id || !user.privateMetadata) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
      stripeCustomerId: null,
    }
  }

  const {
    stripePriceId,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeCurrentPeriodEnd,
  } = user.privateMetadata as {
    stripePriceId: string | null | undefined
    stripeCurrentPeriodEnd: string | null | undefined
    stripeSubscriptionId: string | null | undefined
    stripeCustomerId: string | null | undefined
  }

  const isSubscribed =
    !!stripePriceId &&
    !!stripeCurrentPeriodEnd && // 86400000 = 1 day
    new Date(stripeCurrentPeriodEnd).getTime() + 86_400_000 > Date.now()

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === stripePriceId)
    : null

  let isCanceled = false
  if (isSubscribed && stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    isCanceled = stripePlan.cancel_at_period_end
  }

  return {
    ...plan,
    stripeSubscriptionId,
    stripeCurrentPeriodEnd: stripeCurrentPeriodEnd
      ? new Date(stripeCurrentPeriodEnd)
      : null,
    stripeCustomerId,
    isSubscribed,
    isCanceled,
  }
}
