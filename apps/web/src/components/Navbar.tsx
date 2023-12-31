import MaxWidthWrapper from './MaxWidthWrapper'
import { Button, buttonVariants } from './ui/button'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
import UserAccountNav from './UserAccountNav'
import MobileNav from './MobileNav'
import { HoverShine } from './HoverShine'
import { SignInButton, SignUpButton, currentUser } from '@clerk/nextjs'
import { getUserSubscriptionPlan } from '@/lib/stripe'

const Navbar = async () => {
  const user = await currentUser()
  const subscriptionPlan = await getUserSubscriptionPlan()

  return (
    <nav className="border-border fixed inset-x-0 top-0 z-30 h-14 w-full border-b backdrop-blur transition-all dark:border-zinc-500/20">
      <MaxWidthWrapper className="max-w-screen-8xl">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="font-display z-40 flex px-2 text-3xl font-semibold tracking-tight"
          >
            parlano.
          </Link>
          <MobileNav isAuth={!!user} isPro={subscriptionPlan.isSubscribed} />
          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}
                >
                  Pricing
                </Link>
                <SignInButton>
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </SignInButton>
                <HoverShine>
                  <SignUpButton>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-gradient-to-r from-violet-600 to-rose-600 shadow"
                    >
                      Get started <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </SignUpButton>
                </HoverShine>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}
                >
                  Dashboard
                </Link>
                <UserAccountNav
                  name={
                    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                    'Your Account'
                  }
                  isPro={subscriptionPlan.isSubscribed}
                  email={user.emailAddresses[0].emailAddress}
                  imageUrl={user.imageUrl}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}
export default Navbar
