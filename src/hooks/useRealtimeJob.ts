import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/lib/supabaseClient'
import { mutate } from 'swr'

type Job = Database['public']['Tables']['jobs']['Row']

export const useRealtimeJob = (jobId: string) => {
  useEffect(() => {
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          // Update the specific job in SWR cache
          mutate(`/jobs/${jobId}`, payload.new as Job, false)
          
          // Also update the jobs list cache if it exists
          mutate(
            (key) => typeof key === 'string' && key.startsWith('/jobs?project_id='),
            undefined,
            { revalidate: true }
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobId])
}

export const useRealtimeJobs = (projectId: string) => {
  useEffect(() => {
    const channel = supabase
      .channel(`jobs-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // Revalidate the jobs list for this project
          mutate(`/jobs?project_id=${projectId}`)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])
}