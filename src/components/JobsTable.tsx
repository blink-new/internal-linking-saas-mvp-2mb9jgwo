import React from 'react'
import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/StatusBadge'
import { formatRelativeTime, formatNumber } from '@/lib/formatters'
import { Database } from '@/lib/supabaseClient'
import { useRealtimeJobs } from '@/hooks/useRealtimeJob'

type Job = Database['public']['Tables']['jobs']['Row']

interface JobsTableProps {
  jobs: Job[]
  loading: boolean
  onJobClick: (job: Job) => void
  projectId: string
}

export const JobsTable: React.FC<JobsTableProps> = ({ 
  jobs, 
  loading, 
  onJobClick, 
  projectId 
}) => {
  // Subscribe to real-time updates
  useRealtimeJobs(projectId)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-6 w-[80px]" />
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto max-w-sm">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="h-full w-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No articles yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first Google Docs article to process.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Anchors Added</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job, index) => (
              <motion.tr
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onJobClick(job)}
              >
                <TableCell className="font-medium">
                  <div className="max-w-[300px] truncate">
                    {job.title}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell>
                  {job.status === 'done' ? formatNumber(job.anchors_added) : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeTime(job.updated_at)}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}