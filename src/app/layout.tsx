import './globals.css'
import 'simplebar-react/dist/simplebar.min.css'

import type { Metadata } from 'next'
import { Inter, PT_Serif } from 'next/font/google'

import { Provider as TrpcProvider } from '@/app/_trpc/Provider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import { cn, constructMetadata } from '@/lib/utils'
import { Footer } from '@/components/Footer'

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-sans min-h-screen antialiased',
          inter.className,
          ptSerif.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TrpcProvider>
            <Toaster />
            <Navbar />
            <div className="flex flex-col">
              <Footer />
              <div className="mt-14 flex flex-grow flex-col">{children}</div>
            </div>
          </TrpcProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
