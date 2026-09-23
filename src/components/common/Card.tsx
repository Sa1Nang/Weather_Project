import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  labelledBy?: string
  variant?: 'data' | 'tile' | 'inverted'
}

/**
 * Frosted-glass card over the weather photo: translucent surface,
 * backdrop blur, no heavy shadows. data = 16px · tile = 30px hero ·
 * inverted = Silver 30px.
 */
export function Card({ children, className, labelledBy, variant = 'data' }: CardProps) {
  const base =
    variant === 'tile'
      ? 'rounded-[30px] p-8 shadow-sm backdrop-blur-xl'
      : variant === 'inverted'
        ? 'rounded-[30px] bg-[var(--silver-inverted)] p-8 text-black dark:text-black'
        : 'rounded-2xl border border-white/40 bg-[var(--surface)]/80 p-5 shadow-sm backdrop-blur-xl dark:border-white/10'
  return (
    <section aria-labelledby={labelledBy} className={cn(base, className)}>
      {children}
    </section>
  )
}
