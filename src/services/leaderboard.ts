// Leaderboard data service - fetches from aminauragroup.com
// Auto-syncs every Monday via cron

export interface RepData {
  id: string
  name: string
  weeklyKwh: number  // Weekly kWh in thousands (e.g., 264 = 264k kWh)
  rank: number
  lastUpdated: string
}

// WEEKLY data pulled from aminauragroup.com - updated every Monday
// Last sync: 2026-01-27
// Numbers are in thousands of kWh (k)
export const LEADERBOARD_DATA: RepData[] = [
  { id: '1', name: 'Yusuf K.', weeklyKwh: 247, rank: 1, lastUpdated: '2026-01-27' },
  { id: '2', name: 'Syed N.', weeklyKwh: 237, rank: 2, lastUpdated: '2026-01-27' },
  { id: '3', name: 'Haseeb U.', weeklyKwh: 152, rank: 3, lastUpdated: '2026-01-27' },
  { id: '4', name: 'Jamar J.', weeklyKwh: 136, rank: 4, lastUpdated: '2026-01-27' },
  { id: '5', name: 'Vernon T.', weeklyKwh: 97, rank: 5, lastUpdated: '2026-01-27' },
  { id: '6', name: 'Parion M.', weeklyKwh: 82, rank: 6, lastUpdated: '2026-01-27' },
]

// Calculate deals from weekly kWh (reverse the projection formula)
// weeklyKwh (in k) * 1000 = actual kWh
// kWh = deals * 0.70 * 0.90 * 10000 = deals * 6300
// deals = kWh / 6300
export const kwhToDeals = (weeklyKwhInK: number): number => {
  return Math.round((weeklyKwhInK * 1000) / 6300)
}

// Trip qualifier: 120k kWh/week × 30 weeks
export const TRIP_QUALIFIER = {
  weeklyTarget: 120,  // 120k kWh per week
  weeksRequired: 30,
}

export const getWeeklyLeaderboard = (): RepData[] => {
  return LEADERBOARD_DATA.sort((a, b) => b.weeklyKwh - a.weeklyKwh)
}

export const getLastSyncDate = (): string => {
  return LEADERBOARD_DATA[0]?.lastUpdated || 'Never'
}

// Check if rep hit trip qualifier this week
export const hitTripQualifier = (weeklyKwh: number): boolean => {
  return weeklyKwh >= TRIP_QUALIFIER.weeklyTarget
}
