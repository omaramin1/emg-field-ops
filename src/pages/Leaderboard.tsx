import { useState, useEffect } from 'react'
import { Zap, FileCheck, DollarSign } from 'lucide-react'
import { getDealsLeaderboard, getPayrollLeaderboard, getLastSyncDate, hitTripQualifier, RepData } from '../services/leaderboard'

type BoardType = 'deals' | 'payroll'

export default function LeaderboardPage() {
  const [board, setBoard] = useState<BoardType>('deals')
  
  // Get Viper data
  const leaderboardData = board === 'deals' ? getDealsLeaderboard() : getPayrollLeaderboard()
  const lastSync = getLastSyncDate()

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

  // Team totals
  const teamTotalDeals = leaderboardData.reduce((sum, r) => sum + r.weeklyDeals, 0)
  const teamTotalKwh = leaderboardData.reduce((sum, r) => sum + r.payrollKwh, 0)
  const tripQualifiers = leaderboardData.filter(r => hitTripQualifier(r.payrollKwh)).length

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          🏆 Leaderboard
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '0.375rem 0.75rem',
          color: 'var(--text-secondary)',
          fontSize: '0.7rem'
        }}>
          Viper Data
        </div>
      </div>

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
        {leaderboardData.map((rep, index) => {
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
