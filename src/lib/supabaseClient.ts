import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          site_url: string
          cornerstone_sheet?: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          site_url: string
          cornerstone_sheet?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          site_url?: string
          cornerstone_sheet?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      jobs: {
        Row: {
          id: string
          project_id: string
          title: string
          article_doc: string
          status: 'queued' | 'processing' | 'done' | 'error'
          anchors_added: number
          before_html?: string
          after_html?: string
          error_message?: string
          created_at: string
          updated_at: string
          completed_at?: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          article_doc: string
          status?: 'queued' | 'processing' | 'done' | 'error'
          anchors_added?: number
          before_html?: string
          after_html?: string
          error_message?: string
          created_at?: string
          updated_at?: string
          completed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          article_doc?: string
          status?: 'queued' | 'processing' | 'done' | 'error'
          anchors_added?: number
          before_html?: string
          after_html?: string
          error_message?: string
          created_at?: string
          updated_at?: string
          completed_at?: string
        }
      }
    }
  }
}