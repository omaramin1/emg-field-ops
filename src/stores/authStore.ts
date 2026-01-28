/**
 * Auth Store - Simple rep authentication
 * Uses email + ENM number for login
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export interface Rep {
  id: string
  name: string
  email: string
  enm_number: string
  bio?: string
  profile_pic?: string
  active: boolean
  created_at: string
}

interface AuthState {
  currentRep: Rep | null
  isLoading: boolean
  error: string | null
  
  login: (email: string, enmNumber: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<Pick<Rep, 'name' | 'bio' | 'profile_pic'>>) => Promise<boolean>
}

// Rep roster - add new reps here
// Email as username, ENM number as password
const REP_ROSTER: Omit<Rep, 'created_at'>[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Demo User',
    email: 'demo@emg.com',
    enm_number: '0000',
    active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Felix',
    email: 'felix@emg.com',
    enm_number: '1001',
    active: true
  },
  // Add more reps here:
  // {
  //   id: 'uuid-here',
  //   name: 'Rep Name',
  //   email: 'rep@emg.com',
  //   enm_number: '1234',
  //   active: true
  // },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentRep: null,
      isLoading: false,
      error: null,

      login: async (email: string, enmNumber: string) => {
        set({ isLoading: true, error: null })
        
        const emailLower = email.toLowerCase().trim()
        const rep = REP_ROSTER.find(
          r => r.email.toLowerCase() === emailLower && r.enm_number === enmNumber && r.active
        )
        
        if (!rep) {
          set({ isLoading: false, error: 'Invalid email or ENM number' })
          return false
        }

        // Check if canvasser exists in DB, create if not
        const { data: existing } = await supabase
          .from('canvassers')
          .select('*')
          .eq('id', rep.id)
          .single()

        if (!existing) {
          await supabase.from('canvassers').insert({
            id: rep.id,
            name: rep.name,
            email: rep.email,
            active: true
          })
        }

        set({
          currentRep: { ...rep, created_at: new Date().toISOString() },
          isLoading: false,
          error: null
        })
        
        return true
      },

      logout: () => {
        set({ currentRep: null, error: null })
      },

      updateProfile: async (updates) => {
        const { currentRep } = get()
        if (!currentRep) return false

        // Update in DB
        const { error } = await supabase
          .from('canvassers')
          .update({ name: updates.name })
          .eq('id', currentRep.id)

        if (error) {
          console.error('Failed to update profile:', error)
          return false
        }

        // Update local state
        set({
          currentRep: { ...currentRep, ...updates }
        })
        
        return true
      }
    }),
    {
      name: 'emg-auth',
      partialize: (state) => ({ currentRep: state.currentRep })
    }
  )
)
