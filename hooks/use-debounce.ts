import { useEffect, useState } from 'react'

/**
 * A hook that debounces a value, only updating the returned value after the specified delay.
 * This is useful for search inputs to prevent excessive API calls.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)
    
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
