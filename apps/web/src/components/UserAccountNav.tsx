import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { SignOutButton } from '@clerk/nextjs'
import { User2Icon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const UserAccountNav = async ({
  email,
  imageUrl,
  name,
  isPro,
}: {
  email: string | null
  imageUrl: string | null
  name: string
  isPro: boolean
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="aspect-square h-8 w-8 rounded-full bg-zinc-400">
          <Avatar className="relative h-8 w-8">
            {imageUrl ? (
              <Image
                fill
                src={imageUrl}
                alt="profile picture"
                referrerPolicy="no-referrer"
              />
            ) : (
              <AvatarFallback>
                <span className="sr-only">{name}</span>
                <User2Icon className="h-4 w-4 text-zinc-900 dark:text-zinc-200" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="border bg-white dark:border-neutral-800 dark:bg-neutral-900"
        align="end"
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="5 flex flex-col space-y-0 leading-none">
            {name && (
              <p className="text-sm font-medium text-black dark:text-zinc-200">
                {name}
              </p>
            )}
            {email && (
              <p className="w-[200px] truncate text-xs text-zinc-700 dark:text-zinc-500">
                {email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          {isPro ? (
            <Link href="/dashboard/billing">Manage Subscription</Link>
          ) : (
            <Link href="/pricing">Upgrade</Link>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton>
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAccountNav
