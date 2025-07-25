import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { articleSchema, ArticleFormData } from '@/lib/validators'
import { mutate } from 'swr'

interface AddArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

export const AddArticleDialog: React.FC<AddArticleDialogProps> = ({
  open,
  onOpenChange,
  projectId,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      google_doc_url: '',
    },
  })

  const onSubmit = async (data: ArticleFormData) => {
    setIsLoading(true)
    try {
      // Insert the job
      const { data: job, error: insertError } = await supabase
        .from('jobs')
        .insert({
          project_id: projectId,
          title: data.title,
          article_doc: data.google_doc_url,
          status: 'queued',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Trigger the job processing (this would call your edge function)
      try {
        await supabase.functions.invoke('trigger-job', {
          body: { job_id: job.id },
        })
      } catch (functionError) {
        console.warn('Edge function not available:', functionError)
        // For now, we'll just create the job without triggering processing
      }

      toast({
        title: 'Article added',
        description: 'Your article has been queued for processing.',
      })

      // Refresh the jobs list
      mutate(`/jobs?project_id=${projectId}`)
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding article:', error)
      toast({
        title: 'Error',
        description: 'Failed to add article. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle>Add Article</DialogTitle>
            <DialogDescription>
              Add a Google Docs article to process for internal linking.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article Title</FormLabel>
                    <FormControl>
                      <Input placeholder="How to Build Better Websites" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="google_doc_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Docs URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://docs.google.com/document/d/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Article
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}