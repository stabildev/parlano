import { type ClassValue, clsx } from 'clsx'
import { type Metadata } from 'next/types'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function constructMetadata({
  title = 'Parlano – Chat with your PDFs',
  description = 'Parlano makes it easy to chat with your PDFs.',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
  noIndex = true,
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    icons,
    metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}
