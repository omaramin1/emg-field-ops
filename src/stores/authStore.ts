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
  isAdmin?: boolean
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
  // ADMINS
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Omar',
    email: 'omar.amin.jem@gmail.com',
    enm_number: 'Enm058',
    active: true,
    isAdmin: true
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'Ahmad Amin',
    email: 'ahmad@emgllc.co',
    enm_number: 'ENM001',
    active: true,
    isAdmin: true
  },
  // REPS FROM VIPER
  { id: 'enm115', name: 'Jaydev Solanki', email: 'jayskee1989@gmail.com', enm_number: 'ENM115', active: true },
  { id: 'enm095', name: 'Vernon Thomas', email: 'vernt151@gmail.com', enm_number: 'ENM095', active: true },
  { id: 'enm075', name: 'Jacob Berube', email: 'jakeberube01@gmail.com', enm_number: 'ENM075', active: true },
  { id: 'enm101', name: 'Totiana Washington-Stevens', email: 'totianaw.fcb@gmail.com', enm_number: 'ENM101', active: true },
  { id: 'enm088', name: 'Lejohn Windn', email: 'lejohnw@gmail.com', enm_number: 'ENM088', active: true },
  { id: 'enm045', name: 'Dominic Shea', email: 'dominicshea99@gmail.com', enm_number: 'ENM045', active: true },
  { id: 'enm050', name: 'Tyler Dessaure', email: 'tydesse@gmail.com', enm_number: 'ENM050', active: true },
  { id: 'enm083', name: 'Sean Ivey', email: 'poisenivey@gmail.com', enm_number: 'ENM083', active: true },
  { id: 'enm116', name: 'Quinton Palmer', email: 'cue_palmer@yahoo.com', enm_number: 'ENM116', active: true },
  { id: 'enm064', name: 'Haseeb Uppal', email: 'haseebuppal123@gmail.com', enm_number: 'ENM064', active: true },
  { id: 'enm106', name: 'Marques Haskins', email: 'marques.haskins212@gmail.com', enm_number: 'ENM106', active: true },
  { id: 'enm103', name: 'Talan Alexander', email: 'talanalexander23@gmail.com', enm_number: 'ENM103', active: true },
  { id: 'enm094', name: 'Shibela Goins', email: 'shibelagoins@gmail.com', enm_number: 'ENM094', active: true },
  { id: 'enm086', name: 'Keiron Moore', email: 'kmoore0722@outlook.com', enm_number: 'ENM086', active: true },
  { id: 'enm047', name: 'Steven Moore', email: 'mooresteven227@gmail.com', enm_number: 'ENM047', active: true },
  { id: 'enm070', name: 'Tommy DeSocio', email: 'tommyaeg@emarketinggroup.co', enm_number: 'ENM070', active: true },
  { id: 'enm039', name: 'Paul Oslica', email: 'pauloslica94@gmail.com', enm_number: 'ENM039', active: true },
  { id: 'enm107', name: 'Babacar Niang', email: 'bniang006@gmail.com', enm_number: 'ENM107', active: true },
  { id: 'enm084', name: 'Christian Sawyer', email: 'chrisjeansawyer@gmail.com', enm_number: 'ENM084', active: true },
  { id: 'enm096', name: 'Aiden Harris', email: 'aidenjon.134@gmail.com', enm_number: 'ENM096', active: true },
  { id: 'enm035', name: 'Malani Lamkin', email: 'malani.lamkin@icloud.com', enm_number: 'ENM035', active: true },
  { id: 'enm069', name: 'Cameron Fahey', email: 'cam.fahey97@gmail.com', enm_number: 'ENM069', active: true },
  { id: 'enm104', name: 'Giavanna Agostini', email: 'giavannamodeling@gmail.com', enm_number: 'ENM104', active: true },
  { id: 'enm098', name: 'Parion Martin', email: 'parionmartin02@gmail.com', enm_number: 'ENM098', active: true },
  { id: 'enm071', name: 'Kirubel Motuma', email: 'kirubem@gmail.com', enm_number: 'ENM071', active: true },
  { id: 'enm076', name: 'Vincenzo Castronovo', email: 'vcastronovo16@gmail.com', enm_number: 'ENM076', active: true },
  { id: 'enm093', name: 'Jamar Johnson', email: 'jboydjohnson38@gmail.com', enm_number: 'ENM093', active: true },
  { id: 'enm067', name: 'Yusuf Kamara', email: 'princekamara2727@gmail.com', enm_number: 'ENM067', active: true },
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
