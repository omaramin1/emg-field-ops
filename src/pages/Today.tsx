import { MapPin, Play, TrendingUp, Zap, ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import PullToRefresh from '../components/PullToRefresh'

// Commission constants
const APPROVAL_RATE = 0.70      // 70% approval
const ALLOCATION_RATE = 0.90   // 90% allocation
const KWH_PER_DEAL = 10000     // 10k kWh per deal
const COMMISSION_PER_KWH = 0.015 // $0.015/kWh (adjust as needed)

export default function TodayPage() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const [, setRefreshKey] = useState(0)
  
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  
  // Mock data - will connect to store
  const rep = { name: 'Marcus' }
  const todayDeals = 5  // Deals submitted today
  const doorsKnocked = 67
  const doorsGoal = 100
  const dealsGoal = 10
  
  // Projections based on 60% approval, 90% allocation, 10k kWh/deal
  const projectedApproved = todayDeals * APPROVAL_RATE
  const projectedAllocated = projectedApproved * ALLOCATION_RATE
  const projectedKwh = projectedAllocated * KWH_PER_DEAL
  const projectedEarnings = projectedKwh * COMMISSION_PER_KWH

  const handleRefresh = useCallback(async () => {
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1200))
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="page">
      <div className="greeting">
        {greeting}, {rep.name} <span className="greeting-time">⚡</span>
      </div>

      {/* Deals Card - Primary Focus */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.1) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)'
      }}>
        <div className="card-title">Today's Deals</div>
        <div className="earnings-big" style={{ fontSize: '4rem' }}>{todayDeals}</div>
        <div className="earnings-sub" style={{ marginTop: '0.5rem' }}>
          deals submitted
        </div>
        
        {/* Projections Breakdown */}
        <div style={{ 
          marginTop: '1.25rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid var(--bg-card)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Proj. Approved (70%)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{projectedApproved.toFixed(1)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Proj. Allocated (90%)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{projectedAllocated.toFixed(1)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Proj. kWh
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Zap size={16} style={{ color: 'var(--warning)' }} />
              {(projectedKwh / 1000).toFixed(1)}k
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Proj. Earnings
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent)' }}>
              ${projectedEarnings.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/map')}>
          <MapPin size={18} />
          Map
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/log')}>
          <ClipboardList size={18} />
          View Log
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/door/next')}>
          <Play size={18} />
          Start
        </button>
      </div>

      {/* Progress Card */}
      <div className="card">
        <div className="card-title">Daily Progress</div>
        
        <div className="progress-container">
          <div className="progress-label">
            <span>Doors Knocked</span>
            <span>{doorsKnocked}/{doorsGoal}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min((doorsKnocked / doorsGoal) * 100, 100)}%` }} 
            />
          </div>
        </div>
        
        <div className="progress-container">
          <div className="progress-label">
            <span>Deals</span>
            <span>{todayDeals}/{dealsGoal}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min((todayDeals / dealsGoal) * 100, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
        border: '1px solid rgba(251, 191, 36, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🔥</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>7 Day Streak</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              3 more days for $50 bonus!
            </div>
          </div>
          <button 
            onClick={() => navigate('/achievements')}
            style={{ 
              background: 'rgba(251, 191, 36, 0.2)', 
              border: 'none', 
              borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem',
              color: '#fbbf24',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            View All →
          </button>
        </div>
      </div>

      {/* Quick Action */}
      <button className="btn btn-primary btn-large" onClick={() => navigate('/log')}>
        <ClipboardList size={20} />
        View Log
      </button>
    </div>
    </PullToRefresh>
  )
}

// Removed unused Trophy component
