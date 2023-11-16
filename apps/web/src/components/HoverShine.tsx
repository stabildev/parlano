import { cn } from '../lib/utils'
import { ReactNode } from 'react'

export const HoverShine = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <div className={cn('group relative', className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-600 to-rose-600 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-50"></div>
      {children}
    </div>
  )
}
