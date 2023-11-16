'use client'

import { Button } from '@/components/ui/button'
import { SignInButton, SignOutButton, SignUpButton } from '@clerk/nextjs'
import { ArrowRightIcon, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [open, setOpen] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="sm:hidden">
      <Button variant="ghost" onClick={() => setOpen((prev) => !prev)}>
        <MenuIcon className="relative z-50 h-5 w-5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-0 w-full animate-in fade-in-20 slide-in-from-top-5">
          <ul className="absolute grid w-full gap-3 border-b border-zinc-200 bg-white px-10 pb-8 pt-20 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            {isAuth ? (
              <>
                <li>
                  <Link
                    className="flex w-full items-center font-semibold"
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <SignOutButton>
                    <button
                      className="flex w-full items-center font-semibold"
                      // onClick={() => setOpen(false)}
                    >
                      Sign out
                    </button>
                  </SignOutButton>
                </li>
              </>
            ) : (
              <>
                <li>
                  <SignUpButton>
                    <button
                      className="flex w-full items-center bg-gradient-to-r from-violet-600 to-rose-600 to-50% bg-clip-text font-semibold text-transparent"
                      // onClick={() => setOpen(false)}
                    >
                      Get started
                      <ArrowRightIcon className="ml-2 h-5 w-5 text-rose-500" />
                    </button>
                  </SignUpButton>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <SignInButton>
                    <button
                      className="flex w-full items-center font-semibold"
                      // onClick={() => setOpen(false)}
                    >
                      Sign in
                    </button>
                  </SignInButton>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    className="flex w-full items-center font-semibold"
                    href="/pricing"
                    onClick={() => setOpen(false)}
                  >
                    Pricing
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default MobileNav
