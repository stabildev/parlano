import './globals.css'
import 'simplebar-react/dist/simplebar.min.css'

import type { Metadata } from 'next'
import { Inter, PT_Serif } from 'next/font/google'

import { Provider as TrpcProvider } from './_trpc/Provider'
import { ThemeProvider } from '../components/ThemeProvider'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '../components/ui/toaster'
import Navbar from '../components/Navbar'
import { cn, constructMetadata } from '../lib/utils'
import { Footer } from '../components/Footer'

const inter = Inter({ subsets: ['latin'] })
const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: '700',
  style: 'italic',
  variable: '--display',
})

export const metadata: Metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            'min-h-screen font-sans antialiased',
            inter.className,
            ptSerif.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TrpcProvider>
              <Toaster />
              <Navbar />
              <div className="flex min-h-screen flex-col">
                <div className="mt-14 flex flex-grow flex-col">{children}</div>
                <Footer />
              </div>
            </TrpcProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
