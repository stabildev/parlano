import './globals.css'
import 'simplebar-react/dist/simplebar.min.css'

import type { Metadata } from 'next'
import { Inter, PT_Serif } from 'next/font/google'

import { Provider as TrpcProvider } from '@/app/_trpc/Provider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import { cn, constructMetadata } from '@/lib/utils'

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
            <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
              <div className="flex-grow">{children}</div>
              <footer className="mx-auto flex flex-row items-center p-4 text-xs opacity-20">
                © 2023&nbsp;
                <a
                  href="https://hardcoded.digital"
                  className="underline-offset-2 hover:underline"
                >
                  Hardcoded Digital
                </a>
                . Portfolio demonstration only.
              </footer>
            </div>
          </TrpcProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
