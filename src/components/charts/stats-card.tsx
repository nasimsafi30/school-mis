import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  className?: string
  iconClassName?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatsCardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <div className={cn('p-2 rounded-full', iconClassName || 'bg-primary/10')}>
          <Icon className='h-4 w-4 text-primary' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {description && (
          <p className='text-xs text-muted-foreground mt-1'>{description}</p>
        )}
        {trend && (
          <p className={cn(
            'text-xs mt-1 font-medium',
            trend.positive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
