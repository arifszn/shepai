import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  const saved = localStorage.getItem(key)
  if (saved === null) return defaultValue

  if (typeof defaultValue === 'boolean') {
    return (saved === 'true') as T
  }
  if (typeof defaultValue === 'number') {
    return parseFloat(saved) as T
  }
  return saved as T
}
