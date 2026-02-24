import { useEffect, useRef, useCallback } from 'react'
import { debounce } from '@/utils'

export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  delay: number = 1000
) {
  const savedValueRef = useRef(value)
  const isSavingRef = useRef(false)

  const debouncedSave = useCallback(
    debounce(async (newValue: T) => {
      if (isSavingRef.current) return
      isSavingRef.current = true
      try {
        await onSave(newValue)
        savedValueRef.current = newValue
      } finally {
        isSavingRef.current = false
      }
    }, delay),
    [onSave, delay]
  )

  useEffect(() => {
    if (value !== savedValueRef.current) {
      debouncedSave(value)
    }
  }, [value, debouncedSave])

  return {
    isSaving: isSavingRef.current,
    savedValue: savedValueRef.current
  }
}
