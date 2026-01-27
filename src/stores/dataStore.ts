// Data collection for area planning and future optimization
// Every door knock becomes intelligence for the business

export interface DoorData {
  id: string
  territoryId: string
  address: string
  lat: number
  lng: number
  
  // Outcomes
  knockedAt: Date
  knockedBy: string
  outcome: 'no_answer' | 'no' | 'not_qualified' | 'qualified' | 'signed' | 'callback'
  
  // Qualification data (if conversation happened)
  hasBenefit?: boolean
  benefitType?: string
  objection?: string // What objection did they give?
  
  // Timing data
  dayOfWeek: number
  hourOfDay: number
  
  // Follow-up
  callbackTime?: Date
  callbackNotes?: string
  
  // Conversion
  signupId?: string
}

export interface TerritoryAnalytics {
  territoryId: string
  name: string
  
  // Volume
  totalDoors: number
  doorsKnocked: number
  
  // Outcomes
  noAnswerCount: number
  noAnswerRate: number
  
  notInterestedCount: number
  notInterestedRate: number
  
  qualifiedCount: number
  qualificationRate: number
  
  signedCount: number
  conversionRate: number // signed / knocked
  closeRate: number      // signed / qualified
  
  // Best performing
  bestDayOfWeek: string
  bestHourRange: string
  
  // Common objections
  topObjections: { objection: string; count: number }[]
  
  // Revenue
  totalKwh: number
  totalCommission: number
  revenuePerDoor: number
}

export interface RepPerformance {
  repId: string
  name: string
  
  // Activity
  totalDoorsKnocked: number
  avgDoorsPerDay: number
  
  // Efficiency
  conversionRate: number
  closeRate: number
  avgTimePerDoor: number
  
  // Earnings
  totalEarnings: number
  avgEarningsPerDay: number
  avgEarningsPerDoor: number
  
  // Streaks & Achievements
  currentStreak: number
  longestStreak: number
  achievements: Achievement[]
  
  // Trends
  weekOverWeekGrowth: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_signup', name: 'First Blood', description: 'Get your first signup', icon: '🎯' },
  { id: 'ten_signups', name: 'Double Digits', description: 'Get 10 signups', icon: '🔥' },
  { id: 'fifty_signups', name: 'Closer', description: 'Get 50 signups', icon: '💪' },
  { id: 'hundred_signups', name: 'Centurion', description: 'Get 100 signups', icon: '🏆' },
  { id: 'hundred_doors', name: 'Iron Legs', description: 'Knock 100 doors in a day', icon: '🦵' },
  { id: 'five_day_streak', name: 'Consistent', description: '5-day signup streak', icon: '📈' },
  { id: 'ten_day_streak', name: 'Machine', description: '10-day signup streak', icon: '🤖' },
  { id: 'perfect_day', name: 'Perfect Day', description: '10+ signups in one day', icon: '⭐' },
  { id: 'early_bird', name: 'Early Bird', description: 'First signup before 10am', icon: '🌅' },
  { id: 'closer', name: 'Shark', description: '50%+ close rate (min 10 qualified)', icon: '🦈' },
  { id: 'territory_clear', name: 'Cleared It', description: 'Complete an entire territory', icon: '🗺️' },
  { id: 'thousand_dollars', name: '$1K Week', description: 'Earn $1,000 in a week', icon: '💰' },
]

// Area intelligence - what we learn from the data
export interface AreaIntelligence {
  // Geographic patterns
  hotZones: {
    bounds: { lat: number; lng: number }[]
    conversionRate: number
    signupCount: number
  }[]
  
  coldZones: {
    bounds: { lat: number; lng: number }[]
    conversionRate: number
    commonReason: string
  }[]
  
  // Timing patterns
  bestKnockTimes: {
    dayOfWeek: number
    hourStart: number
    hourEnd: number
    conversionRate: number
  }[]
  
  // Demographic patterns (inferred)
  highBenefitAreas: string[] // Territory IDs with high qualification rates
  
  // Objection patterns
  objectionsByArea: {
    territoryId: string
    topObjection: string
    suggestedResponse: string
  }[]
  
  // Saturation
  saturatedAreas: string[]      // >80% knocked
  freshAreas: string[]          // <20% knocked
  highPotentialAreas: string[]  // Fresh + high conversion in similar areas
}

// Functions to calculate analytics
export function calculateTerritoryAnalytics(
  territoryId: string,
  doors: DoorData[]
): TerritoryAnalytics {
  const territoryDoors = doors.filter(d => d.territoryId === territoryId)
  const knocked = territoryDoors.filter(d => d.knockedAt)
  
  const noAnswer = knocked.filter(d => d.outcome === 'no_answer')
  const notInterested = knocked.filter(d => d.outcome === 'no')
  const qualified = knocked.filter(d => d.outcome === 'qualified' || d.outcome === 'signed')
  const signed = knocked.filter(d => d.outcome === 'signed')
  
  // Find best day
  const dayStats = [0, 1, 2, 3, 4, 5, 6].map(day => {
    const dayDoors = signed.filter(d => d.dayOfWeek === day)
    return { day, count: dayDoors.length }
  })
  const bestDay = dayStats.sort((a, b) => b.count - a.count)[0]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Find best hour range
  const hourStats: Record<string, number> = {}
  signed.forEach(d => {
    const range = `${Math.floor(d.hourOfDay / 2) * 2}-${Math.floor(d.hourOfDay / 2) * 2 + 2}`
    hourStats[range] = (hourStats[range] || 0) + 1
  })
  const bestHour = Object.entries(hourStats).sort((a, b) => b[1] - a[1])[0]
  
  // Top objections
  const objectionCounts: Record<string, number> = {}
  notInterested.forEach(d => {
    if (d.objection) {
      objectionCounts[d.objection] = (objectionCounts[d.objection] || 0) + 1
    }
  })
  const topObjections = Object.entries(objectionCounts)
    .map(([objection, count]) => ({ objection, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  return {
    territoryId,
    name: '', // Would come from territory lookup
    totalDoors: territoryDoors.length,
    doorsKnocked: knocked.length,
    noAnswerCount: noAnswer.length,
    noAnswerRate: knocked.length > 0 ? noAnswer.length / knocked.length : 0,
    notInterestedCount: notInterested.length,
    notInterestedRate: knocked.length > 0 ? notInterested.length / knocked.length : 0,
    qualifiedCount: qualified.length,
    qualificationRate: knocked.length > 0 ? qualified.length / knocked.length : 0,
    signedCount: signed.length,
    conversionRate: knocked.length > 0 ? signed.length / knocked.length : 0,
    closeRate: qualified.length > 0 ? signed.length / qualified.length : 0,
    bestDayOfWeek: dayNames[bestDay?.day || 0],
    bestHourRange: bestHour ? `${bestHour[0]}:00` : 'N/A',
    topObjections,
    totalKwh: signed.length * 10500, // Avg household
    totalCommission: signed.length * 47.50, // Avg commission
    revenuePerDoor: knocked.length > 0 ? (signed.length * 47.50) / knocked.length : 0
  }
}

// Predict best areas for future canvassing
export function predictBestAreas(
  territories: TerritoryAnalytics[],
  targetSignups: number
): { territoryId: string; expectedSignups: number; confidence: number }[] {
  return territories
    .filter(t => t.doorsKnocked < t.totalDoors * 0.8) // Not saturated
    .map(t => {
      const remainingDoors = t.totalDoors - t.doorsKnocked
      const expectedSignups = remainingDoors * t.conversionRate
      const confidence = t.doorsKnocked > 20 ? 0.8 : t.doorsKnocked > 10 ? 0.5 : 0.3
      return { territoryId: t.territoryId, expectedSignups, confidence }
    })
    .sort((a, b) => (b.expectedSignups * b.confidence) - (a.expectedSignups * a.confidence))
}
