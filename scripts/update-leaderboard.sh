#!/bin/bash
# EMG Leaderboard Update Script
# Usage: ./scripts/update-leaderboard.sh "Yusuf K.:21:247,Syed N.:16:237,Jamar J.:13:136,Parion M.:13:82,Vernon T.:12:97"
# Format: "Name:Deals:kWh,Name:Deals:kWh,..."

set -e

DATA=$1
TODAY=$(date +%Y-%m-%d)

if [ -z "$DATA" ]; then
  echo "Usage: ./scripts/update-leaderboard.sh 'Name:Deals:kWh,Name:Deals:kWh,...'"
  exit 1
fi

echo "📊 Updating leaderboard with: $DATA"

# Generate TypeScript
cat > src/services/leaderboard.ts << TSEOF
// Leaderboard data service
// Two leaderboards: Deals (current week) and Payroll (13-day lag)
// Last sync: $TODAY

export interface RepData {
  id: string
  name: string
  weeklyDeals: number
  payrollKwh: number
  lastUpdated: string
}

export const DEALS_LEADERBOARD: RepData[] = [
TSEOF

ID=1
IFS=',' read -ra REPS <<< "$DATA"
for REP in "${REPS[@]}"; do
  IFS=':' read -r NAME DEALS KWH <<< "$REP"
  echo "  { id: '$ID', name: '$NAME', weeklyDeals: $DEALS, payrollKwh: $KWH, lastUpdated: '$TODAY' }," >> src/services/leaderboard.ts
  ((ID++))
done

cat >> src/services/leaderboard.ts << 'TSEOF'
]

export const getDealsLeaderboard = (): RepData[] => {
  return [...DEALS_LEADERBOARD].sort((a, b) => b.weeklyDeals - a.weeklyDeals)
}

export const getPayrollLeaderboard = (): RepData[] => {
  return [...DEALS_LEADERBOARD].sort((a, b) => b.payrollKwh - a.payrollKwh)
}

export const getLastSyncDate = (): string => {
  return DEALS_LEADERBOARD[0]?.lastUpdated || 'Never'
}

export const TRIP_QUALIFIER = {
  weeklyTarget: 120,
  weeksRequired: 30,
}

export const hitTripQualifier = (payrollKwh: number): boolean => {
  return payrollKwh >= TRIP_QUALIFIER.weeklyTarget
}
TSEOF

echo "✅ leaderboard.ts updated"
echo "🚀 Deploying to Vercel..."

npm run build
npx vercel --prod --yes

echo "✅ Done! App updated at https://app-gamma-olive.vercel.app"
