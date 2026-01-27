export default function EarningsPage() {
  // Mock data
  const weeklyEarnings = 847.50
  const weeklyGoal = 1000
  const weeklyProgress = (weeklyEarnings / weeklyGoal) * 100
  
  const dailyBreakdown = [
    { day: 'Mon', earnings: 142.50, signups: 3 },
    { day: 'Tue', earnings: 190.00, signups: 4 },
    { day: 'Wed', earnings: 95.00, signups: 2 },
    { day: 'Thu', earnings: 237.50, signups: 5 },
    { day: 'Fri', earnings: 182.50, signups: 4 },
    { day: 'Sat', earnings: 0, signups: 0 },
    { day: 'Sun', earnings: 0, signups: 0 },
  ]
  
  const pendingPayout = 847.50
  const nextPayday = 'Friday, Jan 31'

  return (
    <div className="page">
      <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        💰 Earnings
      </div>

      {/* This Week */}
      <div className="card">
        <div className="card-title">This Week</div>
        <div className="earnings-big">${weeklyEarnings.toFixed(2)}</div>
        
        <div className="progress-container" style={{ marginTop: '1rem' }}>
          <div className="progress-label">
            <span style={{ color: 'var(--text-secondary)' }}>Weekly Goal</span>
            <span>${weeklyGoal.toFixed(0)}</span>
          </div>
          <div className="progress-bar" style={{ height: '0.75rem' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(weeklyProgress, 100)}%` }} 
            />
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '0.75rem',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem'
        }}>
          ${(weeklyGoal - weeklyEarnings).toFixed(2)} to weekly goal
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="card">
        <div className="card-title">Daily Breakdown</div>
        
        {dailyBreakdown.map((day, index) => {
          const isToday = index === 4 // Friday in this mock
          const maxEarnings = Math.max(...dailyBreakdown.map(d => d.earnings))
          const barWidth = day.earnings > 0 ? (day.earnings / maxEarnings) * 100 : 0
          
          return (
            <div 
              key={day.day}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 0',
                borderBottom: index < dailyBreakdown.length - 1 ? '1px solid var(--bg-card)' : 'none',
                opacity: day.earnings === 0 ? 0.4 : 1
              }}
            >
              <div style={{ width: '40px', fontWeight: isToday ? 700 : 400 }}>
                {day.day}
                {isToday && <span style={{ color: 'var(--accent)' }}> •</span>}
              </div>
              
              <div style={{ flex: 1 }}>
                <div 
                  style={{
                    height: '8px',
                    background: 'var(--bg-card)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      background: 'var(--accent)',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ 
                width: '80px', 
                textAlign: 'right',
                fontWeight: 600,
                color: day.earnings > 0 ? 'var(--accent)' : 'var(--text-secondary)'
              }}>
                {day.earnings > 0 ? `$${day.earnings.toFixed(2)}` : '--'}
              </div>
              
              <div style={{ 
                width: '50px', 
                textAlign: 'right',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}>
                {day.signups > 0 ? `${day.signups} sig` : ''}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pending Payout */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div className="card-title" style={{ color: 'var(--accent-light)' }}>
          💵 Pending Payout
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-light)' }}>
              ${pendingPayout.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Next payday: {nextPayday}
            </div>
          </div>
          <div style={{ fontSize: '2.5rem' }}>🎉</div>
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="card">
        <div className="card-title">All-Time Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>$8,550</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Earned</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>180</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Signups</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>1,847</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Doors Knocked</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>9.7%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Conversion Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
