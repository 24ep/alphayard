import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use Expo env vars for mobile configuration
// Default to local Supabase REST URL exposed via Docker compose and a dev anon key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (you can generate these from your Supabase dashboard)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone_number: string;
          avatar_url: string | null;
          date_of_birth: string | null;
          gender: string | null;
          bio: string | null;
          preferences: {
            language: string;
            theme: 'light' | 'dark' | 'auto';
            notifications: {
              push: boolean;
              email: boolean;
              sms: boolean;
            };
            privacy: {
              location_sharing: boolean;
              profile_visibility: 'public' | 'Circle' | 'private';
              data_sharing: boolean;
            };
          };
          subscription: {
            plan: string;
            status: string;
            expires_at: string;
          } | null;
          circle_id: string | null;
          circle_role: 'admin' | 'member' | null;
          emergency_contacts: Array<{
            id: string;
            name: string;
            phone_number: string;
            relationship: string;
            is_primary: boolean;
          }>;
          created_at: string;
          last_active_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          phone_number: string;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          bio?: string | null;
          preferences?: {
            language: string;
            theme: 'light' | 'dark' | 'auto';
            notifications: {
              push: boolean;
              email: boolean;
              sms: boolean;
            };
            privacy: {
              location_sharing: boolean;
              profile_visibility: 'public' | 'Circle' | 'private';
              data_sharing: boolean;
            };
          };
          subscription?: {
            plan: string;
            status: string;
            expires_at: string;
          } | null;
          circle_id?: string | null;
          circle_role?: 'admin' | 'member' | null;
          emergency_contacts?: Array<{
            id: string;
            name: string;
            phone_number: string;
            relationship: string;
            is_primary: boolean;
          }>;
          created_at?: string;
          last_active_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone_number?: string;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          bio?: string | null;
          preferences?: {
            language: string;
            theme: 'light' | 'dark' | 'auto';
            notifications: {
              push: boolean;
              email: boolean;
              sms: boolean;
            };
            privacy: {
              location_sharing: boolean;
              profile_visibility: 'public' | 'Circle' | 'private';
              data_sharing: boolean;
            };
          };
          subscription?: {
            plan: string;
            status: string;
            expires_at: string;
          } | null;
          circle_id?: string | null;
          circle_role?: 'admin' | 'member' | null;
          emergency_contacts?: Array<{
            id: string;
            name: string;
            phone_number: string;
            relationship: string;
            is_primary: boolean;
          }>;
          created_at?: string;
          last_active_at?: string;
          updated_at?: string;
        };
      };
      families: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      emergency_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone_number: string;
          relationship: string;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone_number: string;
          relationship: string;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone_number?: string;
          relationship?: string;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]; 
