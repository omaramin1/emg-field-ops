// Leaderboard data service
// Two leaderboards: Deals (current week) and Payroll (13-day lag)

export interface RepData {
  id: string
  name: string
  weeklyDeals: number // Current week deal submissions (real-time)
  payrollKwh: number  // kWh hitting payroll this week (13-day lag)
  lastUpdated: string
}

// DEALS LEADERBOARD - Current week submissions (Mon-Sun)
// Last sync: 2026-01-27
export const DEALS_LEADERBOARD: RepData[] = [
  { id: '1', name: 'Yusuf K.', weeklyDeals: 21, payrollKwh: 247, lastUpdated: '2026-01-27' },
  { id: '2', name: 'Syed N.', weeklyDeals: 16, payrollKwh: 237, lastUpdated: '2026-01-27' },
  { id: '3', name: 'Jamar J.', weeklyDeals: 13, payrollKwh: 136, lastUpdated: '2026-01-27' },
  { id: '4', name: 'Parion M.', weeklyDeals: 13, payrollKwh: 82, lastUpdated: '2026-01-27' },
  { id: '5', name: 'Vernon T.', weeklyDeals: 12, payrollKwh: 97, lastUpdated: '2026-01-27' },
]

// Get leaderboard sorted by deals (current week activity)
export const getDealsLeaderboard = (): RepData[] => {
  return [...DEALS_LEADERBOARD].sort((a, b) => b.weeklyDeals - a.weeklyDeals)
}

// Get leaderboard sorted by payroll kWh (what's hitting paychecks)
export const getPayrollLeaderboard = (): RepData[] => {
  return [...DEALS_LEADERBOARD].sort((a, b) => b.payrollKwh - a.payrollKwh)
}

export const getLastSyncDate = (): string => {
  return DEALS_LEADERBOARD[0]?.lastUpdated || 'Never'
}

// Trip qualifier: 120k kWh/week × 30 weeks
export const TRIP_QUALIFIER = {
  weeklyTarget: 120,  // 120k kWh per week
  weeksRequired: 30,
}

// Check if rep hit trip qualifier this week (based on payroll kWh)
export const hitTripQualifier = (payrollKwh: number): boolean => {
  return payrollKwh >= TRIP_QUALIFIER.weeklyTarget
}
