import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100, 'Title too long'),
  site_url: z.string().url('Please enter a valid URL'),
  cornerstone_sheet: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
})

export const articleSchema = z.object({
  title: z.string().min(1, 'Article title is required').max(200, 'Title too long'),
  google_doc_url: z.string().url('Please enter a valid Google Docs URL')
    .refine(url => url.includes('docs.google.com'), 'Must be a Google Docs URL')
})

export type ProjectFormData = z.infer<typeof projectSchema>
export type ArticleFormData = z.infer<typeof articleSchema>