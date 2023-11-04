import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/dist/components'
import { User2Icon, UserIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const UserAccountNav = async ({
  email,
  imageUrl,
  name,
}: {
  email: string | null
  imageUrl: string | null
  name: string
}) => {
  const subscriptionPlan = await getUserSubscriptionPlan()

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
                <User2Icon className="h-4 w-4 text-zinc-900" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="5 flex flex-col space-y-0 leading-none">
            {name && <p className="text-sm font-medium text-black">{name}</p>}
            {email && (
              <p className="w-[200px] truncate text-xs text-zinc-700">
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
          {subscriptionPlan?.isSubscribed ? (
            <Link href="/dashboard/billing">Manage Subscription</Link>
          ) : (
            <Link href="/pricing">Upgrade</Link>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutLink>Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAccountNav
