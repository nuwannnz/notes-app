import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/utils'

export interface ContextMenuProps {
  isOpen: boolean
  x: number
  y: number
  onClose: () => void
  children: ReactNode
}

export function ContextMenu({ isOpen, x, y, onClose, children }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Adjust position to keep menu in viewport
  const adjustedX = Math.min(x, window.innerWidth - 200)
  const adjustedY = Math.min(y, window.innerHeight - 200)

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 min-w-[160px] rounded-md',
        'bg-white dark:bg-surface-dark',
        'border border-neutral-200 dark:border-neutral-700',
        'shadow-lg py-1 animate-fade-in'
      )}
      style={{ left: adjustedX, top: adjustedY }}
    >
      {children}
    </div>
  )
}

export interface ContextMenuItemProps {
  onClick: () => void
  icon?: ReactNode
  children: ReactNode
  variant?: 'default' | 'danger'
  disabled?: boolean
}

export function ContextMenuItem({
  onClick,
  icon,
  children,
  variant = 'default',
  disabled = false
}: ContextMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-sm',
        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'text-neutral-700 dark:text-neutral-300': variant === 'default',
          'text-red-600 dark:text-red-400': variant === 'danger',
        }
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  )
}

export function ContextMenuSeparator() {
  return <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />
}
