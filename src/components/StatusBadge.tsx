import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Clock, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: 'queued' | 'processing' | 'done' | 'error'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'queued':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          label: 'Queued',
          className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        }
      case 'processing':
        return {
          variant: 'secondary' as const,
          icon: Loader2,
          label: 'Processing',
          className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        }
      case 'done':
        return {
          variant: 'secondary' as const,
          icon: CheckCircle,
          label: 'Done',
          className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        }
      case 'error':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          label: 'Error',
          className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        }
      default:
        return {
          variant: 'secondary' as const,
          icon: Clock,
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
      <Icon 
        className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} 
      />
      {config.label}
    </Badge>
  )
}