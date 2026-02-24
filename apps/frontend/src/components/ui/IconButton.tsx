import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-colors',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'disabled:pointer-events-none disabled:opacity-50',
          'text-neutral-600 dark:text-neutral-400',
          {
            'h-6 w-6': size === 'sm',
            'h-8 w-8': size === 'md',
            'h-10 w-10': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
