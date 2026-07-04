import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Full page loading spinner
export function LoadingPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20 mx-auto" />
        </div>
        <p className="text-lg text-muted-foreground font-medium">Loading...</p>
      </div>
    </div>
  )
}

// Card skeleton loader
export function LoadingCard() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <Skeleton className="h-5 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

// Stats card skeleton
export function LoadingStatsCard() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

// Table skeleton loader
export function LoadingTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      {/* Search bar skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 border-b">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-16" />
              <div className="flex-1 flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              {Array.from({ length: cols - 2 }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

// Form skeleton loader
export function LoadingForm({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex justify-end space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

// Chart skeleton loader
export function LoadingChart({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className={`w-full rounded-lg`} style={{ height: `${height}px` }} />
    </div>
  )
}

// Activity feed skeleton
export function LoadingActivity({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <div className="relative">
            <Skeleton className="h-9 w-9 rounded-full" />
            {i < items - 1 && (
              <div className="absolute top-10 left-4 w-px h-8 bg-border" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Profile skeleton
export function LoadingProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Modal/Dialog skeleton
export function LoadingModal() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-1/3" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

// List skeleton
export function LoadingList({ items = 8 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

// Grid cards skeleton
export function LoadingGrid({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Full page with sidebar skeleton
export function LoadingPageWithSidebar() {
  return (
    <div className="flex h-full">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900 p-4">
        <Skeleton className="h-8 w-40 mb-8 bg-gray-800" />
        <div className="space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-5 w-5 rounded bg-gray-800" />
              <Skeleton className="h-4 w-24 bg-gray-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-72 flex-1">
        {/* Header skeleton */}
        <div className="h-16 border-b flex items-center px-4 gap-4">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Content skeleton */}
        <div className="p-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingStatsCard key={i} />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <LoadingChart />
            <LoadingActivity />
          </div>
        </div>
      </div>
    </div>
  )
}

// Button with loading state
export function LoadingButton({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/80 text-primary-foreground rounded-md cursor-wait">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  )
}

// Inline spinner
export function LoadingSpinner({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
  )
}

// Overlay loading
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20 mx-auto" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}