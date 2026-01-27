import { useState, useEffect } from 'react'
import { Zap, FileCheck, Activity, Trophy, Target } from 'lucide-react'
import { getWeeklyLeaderboard, kwhToDeals, TRIP_QUALIFIER, hitTripQualifier, getLastSyncDate } from '../services/leaderboard'

type MetricType = 'kwh' | 'deals'

interface LiveActivity {
  id: string
  repName: string
  action: 'deal' | 'door' | 'callback'
  address?: string
  timestamp: Date
}

export default function LeaderboardPage() {
  const [metric, setMetric] = useState<MetricType>('kwh')
  const [showLive, setShowLive] = useState(true)
  
  // Get real data from aminauragroup.com
  const weeklyData = getWeeklyLeaderboard()
  const lastSync = getLastSyncDate()
  
  // Live activity feed - simulated for now
  const [liveActivity, setLiveActivity] = useState<LiveActivity[]>([
    { id: '1', repName: 'Derrick G.', action: 'deal', address: '142 Oak St', timestamp: new Date(Date.now() - 2 * 60000) },
    { id: '2', repName: 'Zander M.', action: 'door', timestamp: new Date(Date.now() - 5 * 60000) },
    { id: '3', repName: 'Marissa H.', action: 'deal', address: '88 Pine Ave', timestamp: new Date(Date.now() - 8 * 60000) },
    { id: '4', repName: 'Jeffrey M.', action: 'callback', address: '23 Elm Dr', timestamp: new Date(Date.now() - 12 * 60000) },
    { id: '5', repName: 'Ashley W.', action: 'deal', address: '156 Oak St', timestamp: new Date(Date.now() - 15 * 60000) },
  ])

  // Simulate live updates
  useEffect(() => {
    const names = weeklyData.map(r => r.name)
    const actions: ('deal' | 'door' | 'callback')[] = ['deal', 'door', 'door', 'door', 'callback']
    
    const interval = setInterval(() => {
      const newActivity: LiveActivity = {
        id: Date.now().toString(),
        repName: names[Math.floor(Math.random() * names.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        address: Math.random() > 0.5 ? `${Math.floor(Math.random() * 200)} ${['Oak', 'Pine', 'Elm', 'Maple'][Math.floor(Math.random() * 4)]} St` : undefined,
        timestamp: new Date()
      }
      setLiveActivity(prev => [newActivity, ...prev.slice(0, 9)])
    }, 15000)

    return () => clearInterval(interval)
  }, [weeklyData])

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'gold'
    if (rank === 2) return 'silver'
    if (rank === 3) return 'bronze'
    return ''
  }

  const getTimeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000)
    if (mins < 1) return 'just now'
    if (mins === 1) return '1m ago'
    return `${mins}m ago`
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'deal': return '🎉'
      case 'callback': return '📅'
      default: return '🚪'
    }
  }

  const getActivityText = (activity: LiveActivity) => {
    switch (activity.action) {
      case 'deal': return `closed a deal${activity.address ? ` at ${activity.address}` : ''}!`
      case 'callback': return `scheduled callback${activity.address ? ` at ${activity.address}` : ''}`
      default: return 'knocked a door'
    }
  }

  // Team totals
  const teamTotalKwh = weeklyData.reduce((sum, r) => sum + r.weeklyKwh, 0)
  const teamTotalDeals = weeklyData.reduce((sum, r) => sum + kwhToDeals(r.weeklyKwh), 0)
  const tripQualifiers = weeklyData.filter(r => hitTripQualifier(r.weeklyKwh)).length

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          🏆 Weekly Leaderboard
        </div>
        <button
          onClick={() => setShowLive(!showLive)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: showLive ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '1rem',
            padding: '0.375rem 0.75rem',
            color: showLive ? '#ef4444' : 'var(--text-secondary)',
            fontSize: '0.75rem',
            fontWeight: 500
          }}
        >
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: showLive ? '#ef4444' : 'var(--text-secondary)',
            animation: showLive ? 'pulse 1.5s infinite' : 'none'
          }} />
          LIVE
        </button>
      </div>

      {/* Live Activity Feed */}
      {showLive && (
        <div className="card" style={{ 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, var(--bg-secondary) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          maxHeight: '180px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '0.75rem',
            color: '#ef4444',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <Activity size={14} />
            Live Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {liveActivity.slice(0, 4).map((activity, idx) => (
              <div 
                key={activity.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.5rem',
                  background: idx === 0 ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderRadius: '0.5rem',
                  animation: idx === 0 ? 'slideInRight 0.3s ease' : 'none'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{getActivityIcon(activity.action)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, color: activity.action === 'deal' ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {activity.repName}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '0.375rem', fontSize: '0.875rem' }}>
                    {getActivityText(activity)}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {getTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '0.75rem', 
          padding: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>
            {teamTotalKwh}k
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Team kWh</div>
        </div>
        <div style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '0.75rem', 
          padding: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
            {teamTotalDeals}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Est. Deals</div>
        </div>
        <div style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '0.75rem', 
          padding: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a855f7' }}>
            {tripQualifiers}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Trip Pace</div>
        </div>
      </div>

      {/* Metric Toggle */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <button
          onClick={() => setMetric('kwh')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: metric === 'kwh' ? 'var(--warning)' : 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '0.75rem',
            color: 'var(--text-primary)',
            fontWeight: metric === 'kwh' ? 600 : 400,
          }}
        >
          <Zap size={18} />
          kWh
        </button>
        <button
          onClick={() => setMetric('deals')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: metric === 'deals' ? 'var(--accent)' : 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '0.75rem',
            color: 'var(--text-primary)',
            fontWeight: metric === 'deals' ? 600 : 400,
          }}
        >
          <FileCheck size={18} />
          Deals
        </button>
      </div>

      {/* Trip Qualifier Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.05) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Target size={20} style={{ color: '#a855f7' }} />
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a855f7' }}>
            Trip Qualifier: {TRIP_QUALIFIER.weeklyTarget}k kWh/week
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Hit it {TRIP_QUALIFIER.weeksRequired} weeks to earn the trip
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="card">
        {weeklyData.map((rep, index) => {
          const deals = kwhToDeals(rep.weeklyKwh)
          const onTripPace = hitTripQualifier(rep.weeklyKwh)
          
          return (
            <div 
              key={rep.id} 
              className="leaderboard-item"
              style={{ padding: '0.875rem 0' }}
            >
              <div className={`leaderboard-rank ${getRankStyle(index + 1)}`}>
                {getRankEmoji(index + 1)}
              </div>
              <div style={{ flex: 1 }}>
                <div className="leaderboard-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {rep.name}
                  {onTripPace && (
                    <span style={{ 
                      background: 'rgba(168, 85, 247, 0.2)', 
                      color: '#a855f7',
                      fontSize: '0.6rem',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      fontWeight: 600
                    }}>
                      🎯 TRIP
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="leaderboard-value" style={{ 
                  color: metric === 'kwh' ? 'var(--warning)' : 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.25rem'
                }}>
                  {metric === 'kwh' ? (
                    <>
                      <Zap size={14} />
                      {rep.weeklyKwh}k
                    </>
                  ) : (
                    <>
                      {deals} deals
                    </>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {metric === 'kwh' ? `~${deals} deals` : `${rep.weeklyKwh}k kWh`}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Last Updated */}
      <div style={{ 
        textAlign: 'center', 
        color: 'var(--text-secondary)', 
        fontSize: '0.75rem',
        marginTop: '1rem' 
      }}>
        Data from aminauragroup.com · Last sync: {lastSync}
        <br />
        <span style={{ color: 'var(--accent)' }}>Auto-updates every Monday</span>
      </div>
    </div>
  )
}
