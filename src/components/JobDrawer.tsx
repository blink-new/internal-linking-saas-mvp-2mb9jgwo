import React from 'react'
import { motion } from 'framer-motion'
import { X, ExternalLink, Clock, Target } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate, formatDuration, formatNumber } from '@/lib/formatters'
import { Database } from '@/lib/supabaseClient'
import { useRealtimeJob } from '@/hooks/useRealtimeJob'

type Job = Database['public']['Tables']['jobs']['Row']

interface JobDrawerProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DiffViewer: React.FC<{ beforeHtml?: string; afterHtml?: string }> = ({
  beforeHtml,
  afterHtml,
}) => {
  if (!beforeHtml || !afterHtml) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="h-full w-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p>Diff will be available when job completes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[70vh] grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Before</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[60vh] overflow-auto bg-muted/30 p-4 rounded-md">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {beforeHtml}
            </pre>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">After</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[60vh] overflow-auto bg-muted/30 p-4 rounded-md">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {afterHtml}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const JobDrawer: React.FC<JobDrawerProps> = ({ job, open, onOpenChange }) => {
  // Subscribe to real-time updates for this specific job
  useRealtimeJob(job?.id || '')

  if (!job) return null

  const duration = job.completed_at 
    ? formatDuration(job.created_at, job.completed_at)
    : formatDuration(job.created_at)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="h-full flex flex-col"
        >
          <SheetHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <SheetTitle className="text-xl">{job.title}</SheetTitle>
                <SheetDescription className="flex items-center gap-2">
                  <a 
                    href={job.article_doc} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    View Document <ExternalLink className="h-3 w-3" />
                  </a>
                </SheetDescription>
              </div>
              <StatusBadge status={job.status} />
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-6">
            {/* Job Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Anchors Added
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">
                    {job.status === 'done' ? formatNumber(job.anchors_added) : '-'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">{duration}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm">{formatDate(job.created_at)}</div>
                  {job.completed_at && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Completed {formatDate(job.completed_at)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Error Message */}
            {job.status === 'error' && job.error_message && (
              <Card className="border-destructive">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-destructive">{job.error_message}</p>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Diff Viewer */}
            <div>
              <h3 className="text-lg font-semibold mb-4">HTML Diff</h3>
              <DiffViewer beforeHtml={job.before_html} afterHtml={job.after_html} />
            </div>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}