// Leaderboard data service
// Pulls real data from Supabase
// Only shows reps with deals in past 90 days

import { supabase } from '../lib/supabase'

export interface RepData {
  id: string
  name: string
  weeklyDeals: number // Current week deal submissions
  payrollKwh: number  // kWh hitting payroll this week (placeholder)
  totalDeals90Days: number // Deals in past 90 days
  lastDealDate: string
}

// Cache for leaderboard data
let cachedLeaderboard: RepData[] = []
let lastFetch: Date | null = null
const CACHE_DURATION = 60000 // 1 minute

// Get reps with deals in past 90 days
export async function fetchActiveReps(): Promise<RepData[]> {
  // Return cached if fresh
  if (lastFetch && Date.now() - lastFetch.getTime() < CACHE_DURATION && cachedLeaderboard.length > 0) {
    return cachedLeaderboard
  }

  try {
    const now = new Date()
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const weekStart = getWeekStart(now)

    // Get all signed_up knocks in past 90 days
    const { data: deals, error } = await supabase
      .from('knocks')
      .select('canvasser_id, canvasser_name, created_at')
      .eq('result', 'signed_up')
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (error || !deals) {
      console.error('Error fetching leaderboard:', error)
      return cachedLeaderboard
    }

    // Aggregate by canvasser
    const repMap = new Map<string, {
      id: string
      name: string
      weeklyDeals: number
      totalDeals: number
      lastDeal: string
    }>()

    for (const deal of deals) {
      const id = deal.canvasser_id
      const name = deal.canvasser_name || 'Unknown'
      const dealDate = new Date(deal.created_at)
      const isThisWeek = dealDate >= weekStart

      if (!repMap.has(id)) {
        repMap.set(id, {
          id,
          name,
          weeklyDeals: 0,
          totalDeals: 0,
          lastDeal: deal.created_at
        })
      }

      const rep = repMap.get(id)!
      rep.totalDeals++
      if (isThisWeek) {
        rep.weeklyDeals++
      }
    }

    // Convert to array and sort by weekly deals
    cachedLeaderboard = Array.from(repMap.values()).map(r => ({
      id: r.id,
      name: r.name,
      weeklyDeals: r.weeklyDeals,
      payrollKwh: r.weeklyDeals * 12, // Estimate: ~12k kWh per deal
      totalDeals90Days: r.totalDeals,
      lastDealDate: r.lastDeal
    }))

    lastFetch = new Date()
    return cachedLeaderboard
  } catch (e) {
    console.error('Leaderboard fetch error:', e)
    return cachedLeaderboard
  }
}

// Get week start (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Synchronous getters that use cached data
export const getDealsLeaderboard = (): RepData[] => {
  return [...cachedLeaderboard].sort((a, b) => b.weeklyDeals - a.weeklyDeals)
}

export const getPayrollLeaderboard = (): RepData[] => {
  return [...cachedLeaderboard].sort((a, b) => b.payrollKwh - a.payrollKwh)
}

export const getLastSyncDate = (): string => {
  if (!lastFetch) return 'Never'
  return lastFetch.toLocaleTimeString()
}

// Trip qualifier: 120k kWh/week
export const TRIP_QUALIFIER = {
  weeklyTarget: 120,
  weeksRequired: 30,
}

export const hitTripQualifier = (payrollKwh: number): boolean => {
  return payrollKwh >= TRIP_QUALIFIER.weeklyTarget
}

// Subscribe to real-time deal updates
export function subscribeToLeaderboard(onUpdate: () => void): () => void {
  const channel = supabase
    .channel('leaderboard-updates')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'knocks', filter: 'result=eq.signed_up' },
      () => {
        // Invalidate cache and trigger update
        lastFetch = null
        onUpdate()
      }
    )
    .subscribe()

  return () => channel.unsubscribe()
}
