/**
 * Knocks Service - Supabase integration for door knock tracking
 * Real-time sync across all devices
 */

import { supabase, KnockRecord } from './supabase'
import { GPSPosition, reverseGeocode } from './gps'

export type KnockResult = 'not_home' | 'not_interested' | 'signed_up' | 'doesnt_qualify' | 'wrong_address' | 'callback'

export interface CreateKnockInput {
  position: GPSPosition
  result: KnockResult
  notes?: string
  canvasserId: string
  canvasserName?: string
  address?: string // Optional - will reverse geocode if not provided
}

/**
 * Create a new knock record
 */
export async function createKnock(input: CreateKnockInput): Promise<KnockRecord | null> {
  try {
    // Get address if not provided
    let address = input.address
    if (!address) {
      address = await reverseGeocode(input.position.lat, input.position.lng) || undefined
    }

    const { data, error } = await supabase
      .from('knocks')
      .insert({
        lat: input.position.lat,
        lng: input.position.lng,
        address,
        result: input.result,
        notes: input.notes,
        canvasser_id: input.canvasserId,
        canvasser_name: input.canvasserName
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating knock:', error)
      return null
    }

    return data as KnockRecord
  } catch (e) {
    console.error('Create knock error:', e)
    return null
  }
}

/**
 * Get knocks in a bounding box (for map view)
 */
export async function getKnocksInBounds(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  limit: number = 500
): Promise<KnockRecord[]> {
  try {
    const { data, error } = await supabase
      .from('knocks')
      .select('*')
      .gte('lat', minLat)
      .lte('lat', maxLat)
      .gte('lng', minLng)
      .lte('lng', maxLng)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching knocks:', error)
      return []
    }

    return data as KnockRecord[]
  } catch (e) {
    console.error('Get knocks error:', e)
    return []
  }
}

/**
 * Get recent knocks for a canvasser
 */
export async function getCanvasserKnocks(
  canvasserId: string,
  limit: number = 100
): Promise<KnockRecord[]> {
  try {
    const { data, error } = await supabase
      .from('knocks')
      .select('*')
      .eq('canvasser_id', canvasserId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching canvasser knocks:', error)
      return []
    }

    return data as KnockRecord[]
  } catch (e) {
    console.error('Get canvasser knocks error:', e)
    return []
  }
}

/**
 * Get today's knocks (all canvassers)
 */
export async function getTodaysKnocks(): Promise<KnockRecord[]> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('knocks')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching today knocks:', error)
      return []
    }

    return data as KnockRecord[]
  } catch (e) {
    console.error('Get today knocks error:', e)
    return []
  }
}

/**
 * Update a knock record
 */
export async function updateKnock(
  id: string,
  updates: Partial<Pick<KnockRecord, 'result' | 'notes' | 'address'>>
): Promise<KnockRecord | null> {
  try {
    const { data, error } = await supabase
      .from('knocks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating knock:', error)
      return null
    }

    return data as KnockRecord
  } catch (e) {
    console.error('Update knock error:', e)
    return null
  }
}

/**
 * Delete a knock (admin only in production)
 */
export async function deleteKnock(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('knocks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting knock:', error)
      return false
    }

    return true
  } catch (e) {
    console.error('Delete knock error:', e)
    return false
  }
}

/**
 * Subscribe to real-time knock updates
 */
export function subscribeToKnocks(
  onInsert: (knock: KnockRecord) => void,
  onUpdate?: (knock: KnockRecord) => void,
  onDelete?: (id: string) => void
): () => void {
  const channel = supabase
    .channel('knocks-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'knocks' },
      (payload) => onInsert(payload.new as KnockRecord)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'knocks' },
      (payload) => onUpdate?.(payload.new as KnockRecord)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'knocks' },
      (payload) => onDelete?.(payload.old.id)
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}

/**
 * Get knock stats for a time period
 */
export async function getKnockStats(
  startDate: Date,
  endDate?: Date
): Promise<{
  total: number
  signedUp: number
  notHome: number
  notInterested: number
  callbacks: number
  doesntQualify: number
  wrongAddress: number
}> {
  try {
    const { data, error } = await supabase
      .from('knocks')
      .select('result')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate?.toISOString() || new Date().toISOString())

    if (error || !data) {
      return { total: 0, signedUp: 0, notHome: 0, notInterested: 0, callbacks: 0, doesntQualify: 0, wrongAddress: 0 }
    }

    return {
      total: data.length,
      signedUp: data.filter(k => k.result === 'signed_up').length,
      notHome: data.filter(k => k.result === 'not_home').length,
      notInterested: data.filter(k => k.result === 'not_interested').length,
      callbacks: data.filter(k => k.result === 'callback').length,
      doesntQualify: data.filter(k => k.result === 'doesnt_qualify').length,
      wrongAddress: data.filter(k => k.result === 'wrong_address').length,
    }
  } catch (e) {
    console.error('Get knock stats error:', e)
    return { total: 0, signedUp: 0, notHome: 0, notInterested: 0, callbacks: 0, doesntQualify: 0, wrongAddress: 0 }
  }
}
