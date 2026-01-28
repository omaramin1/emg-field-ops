/**
 * Admin Page - Rep locations + master log
 * Only accessible to admins
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase, KnockRecord } from '../lib/supabase'
import { MapPin, List, Users, Clock, Filter, RefreshCw, TrendingUp, AlertTriangle, Zap, Activity } from 'lucide-react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1Ijoib21hcmFtaW4xIiwiYSI6ImNtNmQ3NXBxOTA4OWoya3B2dHRwYWVrdjQifQ.p7dGFEBoNOLWMfKMSJEFEw'

type ViewMode = 'dashboard' | 'map' | 'log'

const RESULT_COLORS: Record<string, string> = {
  'signed_up': '#10b981',
  'not_home': '#6b7280',
  'not_interested': '#ef4444',
  'doesnt_qualify': '#f59e0b',
  'callback': '#3b82f6',
  'wrong_address': '#8b5cf6'
}

const RESULT_LABELS: Record<string, string> = {
  'signed_up': '✅ Signed Up',
  'not_home': '🚫 Not Home',
  'not_interested': '❌ Not Interested',
  'doesnt_qualify': '⚠️ Doesn\'t Qualify',
  'callback': '📞 Callback',
  'wrong_address': '📍 Wrong Address'
}

interface RepStats {
  id: string
  name: string
  totalKnocks: number
  deals: number
  conversionRate: number
  lastActivity: Date | null
  todayKnocks: number
  status: 'crushing' | 'good' | 'needs_help' | 'idle'
}

export function Admin() {
  const navigate = useNavigate()
  const { currentRep } = useAuthStore()
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [knocks, setKnocks] = useState<KnockRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterResult, setFilterResult] = useState<string>('all')
  const [filterRep, setFilterRep] = useState<string>('all')
  const [repStats, setRepStats] = useState<RepStats[]>([])
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])

  // Check admin access
  useEffect(() => {
    if (!currentRep?.isAdmin) {
      navigate('/')
    }
  }, [currentRep, navigate])

  // Load all knocks
  useEffect(() => {
    loadKnocks()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('admin-knocks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'knocks' },
        () => loadKnocks()
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [])

  // Initialize map
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-77.5, 37.5],
      zoom: 8
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [viewMode])

  // Update markers when knocks or filters change
  useEffect(() => {
    if (!map.current || viewMode !== 'map') return

    // Clear old markers
    markers.current.forEach(m => m.remove())
    markers.current = []

    // Filter knocks
    const filtered = knocks.filter(k => {
      if (filterResult !== 'all' && k.result !== filterResult) return false
      if (filterRep !== 'all' && k.canvasser_id !== filterRep) return false
      return true
    })

    // Add markers
    filtered.forEach(knock => {
      const color = RESULT_COLORS[knock.result] || '#666'
      
      const el = document.createElement('div')
      el.innerHTML = `
        <div style="
          width: 14px;
          height: 14px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        "></div>
      `
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([knock.lng, knock.lat])
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`
          <div style="padding: 6px; font-family: system-ui; font-size: 12px;">
            <strong>${knock.canvasser_name || 'Unknown'}</strong><br>
            <span style="color: ${color}">${RESULT_LABELS[knock.result] || knock.result}</span><br>
            ${knock.address ? `<small>${knock.address}</small><br>` : ''}
            <small style="color: #888">${new Date(knock.created_at).toLocaleString()}</small>
          </div>
        `))
        .addTo(map.current!)
      
      markers.current.push(marker)
    })

    // Fit bounds if we have markers
    if (filtered.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      filtered.forEach(k => bounds.extend([k.lng, k.lat]))
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 })
    }
  }, [knocks, filterResult, filterRep, viewMode])

  const loadKnocks = async () => {
    setIsLoading(true)
    
    // Get last 7 days of knocks
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('knocks')
      .select('*')
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false })

    if (!error && data) {
      setKnocks(data as KnockRecord[])
      calculateRepStats(data as KnockRecord[])
    }
    
    setIsLoading(false)
  }

  const calculateRepStats = (knockData: KnockRecord[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)

    const repMap = new Map<string, RepStats>()

    knockData.forEach(knock => {
      const id = knock.canvasser_id
      const knockDate = new Date(knock.created_at)
      
      if (!repMap.has(id)) {
        repMap.set(id, {
          id,
          name: knock.canvasser_name || 'Unknown',
          totalKnocks: 0,
          deals: 0,
          conversionRate: 0,
          lastActivity: null,
          todayKnocks: 0,
          status: 'idle'
        })
      }

      const stats = repMap.get(id)!
      stats.totalKnocks++
      
      if (knock.result === 'signed_up') {
        stats.deals++
      }
      
      if (knockDate >= today) {
        stats.todayKnocks++
      }
      
      if (!stats.lastActivity || knockDate > stats.lastActivity) {
        stats.lastActivity = knockDate
      }
    })

    // Calculate status for each rep
    repMap.forEach(stats => {
      stats.conversionRate = stats.totalKnocks > 0 
        ? Math.round((stats.deals / stats.totalKnocks) * 100) 
        : 0

      // Determine status
      if (!stats.lastActivity || stats.lastActivity < twoHoursAgo) {
        stats.status = 'idle' // No activity in 2+ hours
      } else if (stats.todayKnocks >= 20 && stats.conversionRate >= 10) {
        stats.status = 'crushing' // High volume + good conversion
      } else if (stats.todayKnocks >= 10 || stats.conversionRate >= 5) {
        stats.status = 'good' // Decent activity
      } else if (stats.todayKnocks < 5 && stats.lastActivity > twoHoursAgo) {
        stats.status = 'needs_help' // Active but struggling
      } else {
        stats.status = 'good'
      }
    })

    // Sort by today's knocks descending
    const sorted = Array.from(repMap.values())
      .sort((a, b) => b.todayKnocks - a.todayKnocks)

    setRepStats(sorted)
  }

  const formatTimeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  // Get unique reps from knocks
  const uniqueReps = Array.from(new Set(knocks.map(k => k.canvasser_id)))
    .map(id => {
      const knock = knocks.find(k => k.canvasser_id === id)
      return { id, name: knock?.canvasser_name || 'Unknown' }
    })

  // Filter knocks for log view
  const filteredKnocks = knocks.filter(k => {
    if (filterResult !== 'all' && k.result !== filterResult) return false
    if (filterRep !== 'all' && k.canvasser_id !== filterRep) return false
    return true
  })

  if (!currentRep?.isAdmin) {
    return null
  }

  return (
    <div style={{
      height: 'calc(100vh - 5rem)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)'
    }}>
      {/* Header */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="var(--accent)" />
          <span style={{ fontWeight: 600 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => setViewMode('dashboard')}
            style={{
              padding: '0.4rem 0.6rem',
              background: viewMode === 'dashboard' ? 'var(--accent)' : 'var(--bg-card)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem'
            }}
          >
            <Activity size={12} /> Team
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '0.4rem 0.6rem',
              background: viewMode === 'map' ? 'var(--accent)' : 'var(--bg-card)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem'
            }}
          >
            <MapPin size={12} /> Map
          </button>
          <button
            onClick={() => setViewMode('log')}
            style={{
              padding: '0.4rem 0.6rem',
              background: viewMode === 'log' ? 'var(--accent)' : 'var(--bg-card)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem'
            }}
          >
            <List size={12} /> Log
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        padding: '0.5rem 1rem',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--bg-card)',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Filter size={14} color="var(--text-secondary)" />
        <select
          value={filterRep}
          onChange={(e) => setFilterRep(e.target.value)}
          style={{
            padding: '0.4rem 0.75rem',
            background: 'var(--bg-card)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.8rem'
          }}
        >
          <option value="all">All Reps</option>
          {uniqueReps.map(rep => (
            <option key={rep.id} value={rep.id}>{rep.name}</option>
          ))}
        </select>
        <select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          style={{
            padding: '0.4rem 0.75rem',
            background: 'var(--bg-card)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.8rem'
          }}
        >
          <option value="all">All Results</option>
          {Object.entries(RESULT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          onClick={loadKnocks}
          disabled={isLoading}
          style={{
            padding: '0.4rem',
            background: 'var(--bg-card)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
          {filteredKnocks.length} knocks (7 days)
        </span>
      </div>

      {/* Content */}
      {viewMode === 'dashboard' ? (
        <div style={{ flex: 1, overflow: 'auto', padding: '0.75rem' }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ background: '#10b981', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{repStats.filter(r => r.status === 'crushing').length}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>🔥 Crushing</div>
            </div>
            <div style={{ background: '#3b82f6', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{repStats.filter(r => r.status === 'good').length}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>👍 Good</div>
            </div>
            <div style={{ background: '#f59e0b', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{repStats.filter(r => r.status === 'needs_help').length}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>⚠️ Needs Help</div>
            </div>
            <div style={{ background: '#6b7280', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{repStats.filter(r => r.status === 'idle').length}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>💤 Idle</div>
            </div>
          </div>

          {/* Rep List by Status */}
          {['crushing', 'good', 'needs_help', 'idle'].map(status => {
            const reps = repStats.filter(r => r.status === status)
            if (reps.length === 0) return null
            
            const statusConfig = {
              crushing: { label: '🔥 Crushing It', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              good: { label: '👍 Doing Good', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
              needs_help: { label: '⚠️ Needs Help', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              idle: { label: '💤 Not Moving', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
            }[status]!

            return (
              <div key={status} style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  color: statusConfig.color,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {statusConfig.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {reps.map(rep => (
                    <div
                      key={rep.id}
                      style={{
                        background: statusConfig.bg,
                        borderLeft: `3px solid ${statusConfig.color}`,
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rep.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          Last: {rep.lastActivity ? formatTimeAgo(rep.lastActivity) : 'Never'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {rep.todayKnocks} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>today</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: statusConfig.color }}>
                          {rep.deals} deals ({rep.conversionRate}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : viewMode === 'map' ? (
        <div ref={mapContainer} style={{ flex: 1 }} />
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading...
            </div>
          ) : filteredKnocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No knocks found
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredKnocks.map(knock => (
                <div
                  key={knock.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    borderLeft: `3px solid ${RESULT_COLORS[knock.result] || '#666'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {knock.canvasser_name || 'Unknown'}
                    </span>
                    <span style={{ 
                      color: RESULT_COLORS[knock.result],
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}>
                      {RESULT_LABELS[knock.result] || knock.result}
                    </span>
                  </div>
                  {knock.address && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} /> {knock.address}
                    </div>
                  )}
                  {knock.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                      "{knock.notes}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={10} /> {new Date(knock.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
