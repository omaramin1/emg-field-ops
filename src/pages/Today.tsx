import { MapPin, Play, Zap, ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import PullToRefresh from '../components/PullToRefresh'
import { useAuthStore } from '../stores/authStore'
import { getTodaysKnocks } from '../lib/knocks'
import { KnockRecord } from '../lib/supabase'

// Commission constants
const APPROVAL_RATE = 0.70      // 70% approval
const ALLOCATION_RATE = 0.90   // 90% allocation
const KWH_PER_DEAL = 10000     // 10k kWh per deal
const COMMISSION_PER_KWH = 0.015 // $0.015/kWh

export default function TodayPage() {
  const navigate = useNavigate()
  const { currentRep } = useAuthStore()
  const hour = new Date().getHours()
  
  const [todaysKnocks, setTodaysKnocks] = useState<KnockRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  
  // Load today's knocks for this rep
  useEffect(() => {
    loadTodaysData()
  }, [currentRep])

  const loadTodaysData = async () => {
    if (!currentRep) return
    setIsLoading(true)
    const knocks = await getTodaysKnocks()
    // Filter to only this rep's knocks
    const myKnocks = knocks.filter(k => k.canvasser_id === currentRep.id)
    setTodaysKnocks(myKnocks)
    setIsLoading(false)
  }

  // Calculate real stats from knocks
  const todayDeals = todaysKnocks.filter(k => k.result === 'signed_up').length
  const doorsKnocked = todaysKnocks.length
  const doorsGoal = 50
  const dealsGoal = 5
  
  // Projections based on approval/allocation rates
  const projectedApproved = todayDeals * APPROVAL_RATE
  const projectedAllocated = projectedApproved * ALLOCATION_RATE
  const projectedKwh = projectedAllocated * KWH_PER_DEAL
  const projectedEarnings = projectedKwh * COMMISSION_PER_KWH

  const handleRefresh = useCallback(async () => {
    await loadTodaysData()
  }, [currentRep])

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="page">
      <div className="greeting">
        {greeting}, {currentRep?.name?.split(' ')[0] || 'Rep'} <span className="greeting-time">⚡</span>
      </div>

      {/* Deals Card - Primary Focus */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.1) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)'
      }}>
        <div className="card-title">Today's Deals</div>
        <div className="earnings-big" style={{ fontSize: '4rem' }}>
          {isLoading ? '...' : todayDeals}
        </div>
        <div className="earnings-sub" style={{ marginTop: '0.5rem' }}>
          deals submitted
        </div>
        
        {/* Projections Breakdown */}
        {todayDeals > 0 && (
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
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/map')}>
          <MapPin size={18} />
          Map
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/log')}>
          <ClipboardList size={18} />
          Log
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/map')}>
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
            <span>{isLoading ? '...' : doorsKnocked}/{doorsGoal}</span>
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
            <span>{isLoading ? '...' : todayDeals}/{dealsGoal}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min((todayDeals / dealsGoal) * 100, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Quick Link */}
      <div 
        className="card" 
        onClick={() => navigate('/leaderboard')}
        style={{ 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <div>
            <div style={{ fontWeight: 600 }}>Leaderboard</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>See team rankings</div>
          </div>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>→</div>
      </div>

    </div>
    </PullToRefresh>
  )
}
