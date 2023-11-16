import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
import UserAccountNav from '@/components/UserAccountNav'
import MobileNav from '@/components/MobileNav'
import { HoverShine } from '@/components/HoverShine'
import { SignInButton, SignUpButton, auth, currentUser } from '@clerk/nextjs'

const Navbar = async () => {
  const user = await currentUser()

  return (
    <nav className="fixed inset-x-0 top-0 z-30 h-14 w-full border-b border-border backdrop-blur transition-all dark:border-zinc-500/20">
      <MaxWidthWrapper className="max-w-screen-8xl">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="z-40 flex px-2 font-display text-3xl font-semibold"
          >
            parlano.
          </Link>
          <MobileNav isAuth={!!user} />
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
