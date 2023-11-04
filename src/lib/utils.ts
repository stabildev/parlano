import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  if (typeof window !== 'undefined') {
    return path
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`
  }
  return `${process.env.NEXT_PUBLIC_URL}${path}`
}
