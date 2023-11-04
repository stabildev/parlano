'use client'

import { Button } from '@/components/ui/button'
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
        <MenuIcon className="relative z-50 h-5 w-5 text-zinc-700" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-0 w-full animate-in fade-in-20 slide-in-from-top-5">
          <ul className="absolute grid w-full gap-3 border-b border-zinc-200 bg-white px-10 pb-8 pt-20 shadow-xl">
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
                  <Link
                    className="flex w-full items-center font-semibold"
                    href="/sign-out"
                    onClick={() => setOpen(false)}
                  >
                    Sign out
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    className="flex w-full items-center font-semibold text-green-600"
                    href="/sign-up"
                    onClick={() => setOpen(false)}
                  >
                    Get started
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    className="flex w-full items-center font-semibold"
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
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
