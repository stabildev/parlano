'use client'

import { SignOutButton as ClerkSignOutButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface Props
  extends React.ComponentPropsWithoutRef<typeof ClerkSignOutButton> {
  redirectUrl?: string
}

export const SignOutButton = ({
  redirectUrl,
  signOutCallback,
  ...props
}: Props) => {
  const router = useRouter()
  return (
    <ClerkSignOutButton
      {...props}
      signOutCallback={() => {
        signOutCallback?.()
        redirectUrl && router.push(redirectUrl)
      }}
    />
  )
}
