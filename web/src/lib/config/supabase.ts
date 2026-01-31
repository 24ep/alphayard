import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Re-export database types from mobile app structure
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone_number: string
          avatar_url: string | null
          date_of_birth: string | null
          gender: string | null
          bio: string | null
          preferences: {
            language: string
            theme: 'light' | 'dark' | 'auto'
            notifications: {
              push: boolean
              email: boolean
              sms: boolean
            }
            privacy: {
              location_sharing: boolean
              profile_visibility: 'public' | 'hourse' | 'private'
              data_sharing: boolean
            }
          }
          subscription: {
            plan: string
            status: string
            expires_at: string
          } | null
          Circle_id: string | null
          Circle_role: 'admin' | 'member' | null
          emergency_contacts: Array<{
            id: string
            name: string
            phone_number: string
            relationship: string
            is_primary: boolean
          }>
          created_at: string
          last_active_at: string
          updated_at: string
        }
      }
      families: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}


