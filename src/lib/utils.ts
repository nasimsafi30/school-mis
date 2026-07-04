import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function generateId(prefix: string = '') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return (prefix + timestamp + random).toUpperCase()
}

export function getInitials(firstName: string, lastName: string) {
  return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase()
}

export function truncate(str: string, length: number) {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}
