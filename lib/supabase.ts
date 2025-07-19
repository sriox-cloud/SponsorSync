import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "organizer" | "sponsor" | "admin"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: "organizer" | "sponsor" | "admin"
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          title: string
          description: string | null
          category: string
          event_date: string | null
          location: string | null
          is_online: boolean
          expected_audience: number | null
          audience_demographic: any
          sponsorship_needs: string[]
          marketing_plan: any
          status: string
          created_at: string
          updated_at: string
        }
      }
      sponsors: {
        Row: {
          id: string
          company_name: string
          industry: string | null
          description: string | null
          preferred_event_types: string[]
          profile_completion: number
        }
      }
      matches: {
        Row: {
          id: string
          event_id: string
          sponsor_id: string
          match_score: number
          is_featured: boolean
          created_at: string
        }
      }
    }
  }
}
