import { createClient } from '@supabase/supabase-js'

// @ts-ignore - Vite env types
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
// @ts-ignore - Vite env types
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - using demo mode')
}

// Demo fallback for development
const url = supabaseUrl || 'https://demo.supabase.co'
const key = supabaseAnonKey || 'demo-key'

export const supabase = createClient(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Types for the database
export interface KnockRecord {
  id: string
  lat: number
  lng: number
  address?: string
  result: 'not_home' | 'not_interested' | 'signed_up' | 'doesnt_qualify' | 'wrong_address' | 'callback'
  notes?: string
  canvasser_id: string
  canvasser_name?: string
  created_at: string
  updated_at: string
}

export interface Zone {
  id: string
  name: string
  geojson: any
  active: boolean
  created_at: string
}

export interface Canvasser {
  id: string
  name: string
  email?: string
  phone?: string
  team_id?: string
  active: boolean
  created_at: string
}
