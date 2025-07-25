import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, ExternalLink, Calendar, Globe } from 'lucide-react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AddArticleDialog } from '@/components/AddArticleDialog'
import { JobsTable } from '@/components/JobsTable'
import { JobDrawer } from '@/components/JobDrawer'
import { supabase } from '@/lib/supabaseClient'
import { formatDate } from '@/lib/formatters'
import { Database } from '@/lib/supabaseClient'

type Project = Database['public']['Tables']['projects']['Row']
type Job = Database['public']['Tables']['jobs']['Row']

const projectFetcher = async (url: string) => {
  const projectId = url.split('/').pop()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data
}

const jobsFetcher = async (url: string) => {
  const projectId = new URLSearchParams(url.split('?')[1]).get('project_id')
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [showAddArticleDialog, setShowAddArticleDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobDrawer, setShowJobDrawer] = useState(false)

  const { data: project, error: projectError, isLoading: projectLoading } = useSWR<Project>(
    id ? `/project/${id}` : null,
    projectFetcher
  )

  const { data: jobs, error: jobsError, isLoading: jobsLoading } = useSWR<Job[]>(
    id ? `/jobs?project_id=${id}` : null,
    jobsFetcher
  )

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setShowJobDrawer(true)
  }

  if (projectError || jobsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Project</h2>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Projects
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">
            {projectLoading ? <Skeleton className="h-4 w-32" /> : project?.title}
          </span>
        </div>

        {/* Project Header */}
        {projectLoading ? (
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </CardContent>
          </Card>
        ) : project ? (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{project.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4" />
                    Created {formatDate(project.created_at)}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddArticleDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Article
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Site URL</span>
                  </div>
                  <a 
                    href={project.site_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    {project.site_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                
                {project.cornerstone_sheet && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Cornerstone Sheet</span>
                    </div>
                    <a 
                      href={project.cornerstone_sheet} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      View Sheet
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Jobs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Articles</h2>
              <p className="text-muted-foreground">
                Track the progress of your internal linking jobs.
              </p>
            </div>
          </div>

          <JobsTable
            jobs={jobs || []}
            loading={jobsLoading}
            onJobClick={handleJobClick}
            projectId={id || ''}
          />
        </div>
      </motion.div>

      {/* Dialogs */}
      {id && (
        <AddArticleDialog
          open={showAddArticleDialog}
          onOpenChange={setShowAddArticleDialog}
          projectId={id}
        />
      )}

      <JobDrawer
        job={selectedJob}
        open={showJobDrawer}
        onOpenChange={setShowJobDrawer}
      />
    </div>
  )
}