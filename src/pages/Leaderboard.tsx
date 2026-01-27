import { useState, useEffect } from 'react'
import { Zap, FileCheck, Activity, DollarSign } from 'lucide-react'
import { getDealsLeaderboard, getPayrollLeaderboard, getLastSyncDate, TRIP_QUALIFIER, hitTripQualifier } from '../services/leaderboard'

type BoardType = 'deals' | 'payroll'

interface LiveActivity {
  id: string
  repName: string
  action: 'deal' | 'door' | 'callback'
  address?: string
  timestamp: Date
}

export default function LeaderboardPage() {
  const [board, setBoard] = useState<BoardType>('deals')
  const [showLive, setShowLive] = useState(true)
  
  // Get data based on selected board
  const dealsData = getDealsLeaderboard()
  const payrollData = getPayrollLeaderboard()
  const currentData = board === 'deals' ? dealsData : payrollData
  const lastSync = getLastSyncDate()
  
  // Live activity feed - simulated for now
  const [liveActivity, setLiveActivity] = useState<LiveActivity[]>([
    { id: '1', repName: 'Yusuf K.', action: 'deal', address: '142 Oak St', timestamp: new Date(Date.now() - 2 * 60000) },
    { id: '2', repName: 'Syed N.', action: 'door', timestamp: new Date(Date.now() - 5 * 60000) },
    { id: '3', repName: 'Jamar J.', action: 'deal', address: '88 Pine Ave', timestamp: new Date(Date.now() - 8 * 60000) },
    { id: '4', repName: 'Vernon T.', action: 'callback', address: '23 Elm Dr', timestamp: new Date(Date.now() - 12 * 60000) },
    { id: '5', repName: 'Parion M.', action: 'deal', address: '156 Oak St', timestamp: new Date(Date.now() - 15 * 60000) },
  ])

  // Simulate live updates
  useEffect(() => {
    const names = dealsData.map(r => r.name)
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
  }, [dealsData])

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
  const teamTotalDeals = dealsData.reduce((sum, r) => sum + r.weeklyDeals, 0)
  const teamTotalKwh = payrollData.reduce((sum, r) => sum + r.payrollKwh, 0)
  const tripQualifiers = payrollData.filter(r => hitTripQualifier(r.payrollKwh)).length

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          🏆 Leaderboard
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
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
            {teamTotalDeals}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Payroll Deals</div>
        </div>
        <div style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '0.75rem', 
          padding: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>
            {teamTotalKwh}k
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Payroll kWh</div>
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

      {/* Board Toggle */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <button
          onClick={() => setBoard('deals')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: board === 'deals' ? 'var(--accent)' : 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '0.75rem',
            color: 'var(--text-primary)',
            fontWeight: board === 'deals' ? 600 : 400,
          }}
        >
          <FileCheck size={18} />
          Deals
        </button>
        <button
          onClick={() => setBoard('payroll')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: board === 'payroll' ? 'var(--warning)' : 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '0.75rem',
            color: 'var(--text-primary)',
            fontWeight: board === 'payroll' ? 600 : 400,
          }}
        >
          <DollarSign size={18} />
          Payroll
        </button>
      </div>

      {/* Board Description */}
      <div style={{
        background: board === 'deals' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
        border: `1px solid ${board === 'deals' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`,
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: board === 'deals' ? 'var(--accent)' : 'var(--warning)' }}>
          {board === 'deals' ? '📝 Payroll Deals' : '💰 Payroll kWh'}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {board === 'deals' 
            ? 'Deals hitting payroll this week (Mon-Sun)' 
            : 'kWh hitting payroll this week (Mon-Sun)'}
        </div>
      </div>

      {/* Rankings */}
      <div className="card">
        {currentData.map((rep, index) => {
          const onTripPace = hitTripQualifier(rep.payrollKwh)
          
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
                  color: board === 'deals' ? 'var(--accent)' : 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.25rem'
                }}>
                  {board === 'deals' ? (
                    <>
                      {rep.weeklyDeals} deals
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      {rep.payrollKwh}k
                    </>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {board === 'deals' ? `${rep.payrollKwh}k kWh` : `${rep.weeklyDeals} deals`}
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
        Last sync: {lastSync}
      </div>
    </div>
  )
}
