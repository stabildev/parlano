import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import UpgradeButton from '@/components/UpgradeButton'
import { buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PLANS } from '@/config/stripe'
import { cn } from '@/lib/utils'
import { auth } from '@clerk/nextjs'
import {
  ArrowRightIcon,
  CheckIcon,
  HelpCircleIcon,
  MinusIcon,
} from 'lucide-react'
import Link from 'next/link'

const Page = async () => {
  const { userId } = auth()

  const pricingItems = [
    {
      plan: 'Free',
      tagline: 'For small side projects.',
      quota: 10,
      features: [
        {
          text: '5 pages per PDF',
          footnote: 'The maximum amount of pages per PDF-file.',
        },
        {
          text: '4MB file size limit',
          footnote: 'The maximum file size of a single PDF file.',
        },
        {
          text: 'Mobile-friendly interface',
        },
        {
          text: 'Higher-quality responses',
          footnote: 'Better algorithmic responses for enhanced content quality',
          negative: true,
        },
        {
          text: 'Priority support',
          negative: true,
        },
      ],
    },
    {
      plan: 'Pro',
      tagline: 'For larger projects with higher needs.',
      quota: PLANS.find((p) => p.slug === 'pro')!.quota,
      features: [
        {
          text: '25 pages per PDF',
          footnote: 'The maximum amount of pages per PDF-file.',
        },
        {
          text: '16MB file size limit',
          footnote: 'The maximum file size of a single PDF file.',
        },
        {
          text: 'Mobile-friendly interface',
        },
        {
          text: 'Higher-quality responses',
          footnote: 'Better algorithmic responses for enhanced content quality',
        },
        {
          text: 'Priority support',
        },
      ],
    },
  ]

  return (
    <MaxWidthWrapper className="mb-8 mt-24 max-w-5xl text-center">
      <div className="mx-auto mb-10 sm:max-w-lg">
        <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
        <p className="mt-5 text-zinc-500 dark:text-zinc-400 sm:text-lg">
          Whether you&apos;re just trying out our service or need more,
          we&apos;ve got you covered.
        </p>
      </div>

      <div className="flex flex-col-reverse justify-center gap-10 pt-12 md:flex-row">
        <TooltipProvider>
          {pricingItems.map(({ plan, tagline, quota, features }) => {
            const price =
              PLANS.find((p) => p.slug === plan.toLowerCase())?.price.amount ||
              0

            return (
              <div
                key={plan}
                className={cn(
                  'relative rounded-2xl shadow-md dark:bg-zinc-500/10',
                  {
                    'border-2 border-blue-500 shadow-blue-200 dark:border-zinc-700 dark:shadow-zinc-800':
                      plan === 'Pro',
                    'border border-zinc-500/20': plan !== 'Pro',
                  }
                )}
              >
                {plan === 'Pro' && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-violet-600 to-rose-600 px-3 py-2 text-sm font-medium text-white shadow">
                    Upgrade now
                  </div>
                )}

                <div className="p-5">
                  <h3 className="my-3 text-center text-3xl font-bold">
                    {plan}
                  </h3>
                  <p className="text-zinc-500">{tagline}</p>
                  <p className="my-5 text-6xl font-semibold">${price}</p>
                  <p className="text-zinc-500">per month</p>
                </div>

                <div className="flex h-20 items-center justify-center border-b border-t border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40">
                  <div className="flex items-center space-x-1">
                    <p>{quota.toLocaleString()} PDFs/mo included</p>

                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="ml-1.5 cursor-default">
                        <HelpCircleIcon className="h-4 w-4 text-zinc-500" />
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-2">
                        How many PDFs you can upload per month.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <ul className="my-10 space-y-5 px-8">
                  {features.map(({ text, footnote, negative }) => (
                    <li key={text} className="flex space-x-5">
                      <div className="flex-shrink-0">
                        {negative ? (
                          <MinusIcon className="h-6 w-6 text-zinc-300" />
                        ) : (
                          <CheckIcon className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      {footnote ? (
                        <div className="flex items-center space-x-1">
                          <p
                            className={cn('text-zinc-400', {
                              'text-zinc-500': negative,
                            })}
                          >
                            {text}
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger className="ml-1.5 cursor-default">
                                <HelpCircleIcon className="h-4 w-4 text-zinc-500" />
                              </TooltipTrigger>
                              <TooltipContent className="w-80 p-2">
                                {footnote}
                              </TooltipContent>
                            </Tooltip>
                          </p>
                        </div>
                      ) : (
                        <p
                          className={cn('text-zinc-400', {
                            'text-zinc-500': negative,
                          })}
                        >
                          {text}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-zinc-200 dark:border-zinc-700" />
                <div className="p-5">
                  {plan === 'Free' ? (
                    <Link
                      href={userId ? '/dashboard' : '/sign-in'}
                      className={buttonVariants({
                        className: 'w-full ',
                        variant: 'outline',
                      })}
                    >
                      {userId ? 'Upgrade now' : 'Sign up'}
                      <ArrowRightIcon className="ml-1.5 h-5 w-5" />
                    </Link>
                  ) : userId ? (
                    <UpgradeButton />
                  ) : (
                    <Link
                      href="/sign-in"
                      className={buttonVariants({
                        className:
                          'w-full bg-gradient-to-r from-violet-600 to-rose-600',
                        variant: 'secondary',
                      })}
                    >
                      {userId ? 'Upgrade now' : 'Sign up'}
                      <ArrowRightIcon className="ml-1.5 h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </TooltipProvider>
      </div>
    </MaxWidthWrapper>
  )
}

export default Page
