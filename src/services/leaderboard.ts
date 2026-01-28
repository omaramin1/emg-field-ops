// Leaderboard data service
// Weekly leaderboard: Viper data (updated Mondays)
// Team Feed: App tap logs (real-time) - handled separately

export interface RepData {
  id: string
  name: string
  weeklyDeals: number // From Viper - deals hitting payroll this week
  payrollKwh: number  // From Viper - kWh hitting payroll this week
  lastUpdated: string
}

// ============================================
// VIPER LEADERBOARD DATA
// Last sync: 2026-01-27 (Monday)
// Update every Monday from Viper portal
// ============================================
export const DEALS_LEADERBOARD: RepData[] = [
  { id: '1', name: 'Yusuf K.', weeklyDeals: 21, payrollKwh: 247, lastUpdated: '2026-01-27' },
  { id: '2', name: 'Syed N.', weeklyDeals: 16, payrollKwh: 237, lastUpdated: '2026-01-27' },
  { id: '3', name: 'Jamar J.', weeklyDeals: 13, payrollKwh: 136, lastUpdated: '2026-01-27' },
  { id: '4', name: 'Parion M.', weeklyDeals: 13, payrollKwh: 82, lastUpdated: '2026-01-27' },
  { id: '5', name: 'Vernon T.', weeklyDeals: 12, payrollKwh: 97, lastUpdated: '2026-01-27' },
]

// Get leaderboard sorted by deals
export const getDealsLeaderboard = (): RepData[] => {
  return [...DEALS_LEADERBOARD].sort((a, b) => b.weeklyDeals - a.weeklyDeals)
}

// Get leaderboard sorted by payroll kWh
export const getPayrollLeaderboard = (): RepData[] => {
  return [...DEALS_LEADERBOARD].sort((a, b) => b.payrollKwh - a.payrollKwh)
}

export const getLastSyncDate = (): string => {
  return DEALS_LEADERBOARD[0]?.lastUpdated || 'Never'
}

// Trip qualifier: 120k kWh/week
export const TRIP_QUALIFIER = {
  weeklyTarget: 120,
  weeksRequired: 30,
}

export const hitTripQualifier = (payrollKwh: number): boolean => {
  return payrollKwh >= TRIP_QUALIFIER.weeklyTarget
}

// For compatibility with new leaderboard page
export interface ExtendedRepData extends RepData {
  totalDeals90Days?: number
}

export async function fetchActiveReps(): Promise<ExtendedRepData[]> {
  // Returns Viper data - no async needed but keeping interface
  return DEALS_LEADERBOARD.map(r => ({
    ...r,
    totalDeals90Days: r.weeklyDeals * 4 // Rough estimate
  }))
}

export function subscribeToLeaderboard(_onUpdate: () => void): () => void {
  // Viper data is static until Monday update - no real-time subscription
  return () => {}
}
