import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Filter } from 'lucide-react'
import { supabase, KnockRecord } from '../lib/supabase'

type DateRange = 'today' | 'yesterday' | 'week' | 'custom'

const RESULT_COLORS: Record<string, string> = {
  not_home: '#6b7280',
  not_interested: '#ef4444',
  signed_up: '#10b981',
  doesnt_qualify: '#f59e0b',
  wrong_address: '#8b5cf6',
  callback: '#3b82f6',
}

const RESULT_LABELS: Record<string, string> = {
  not_home: 'Not Home',
  not_interested: 'Not Interested',
  signed_up: 'Signed Up ✓',
  doesnt_qualify: "Doesn't Qualify",
  wrong_address: 'Wrong Address',
  callback: 'Callback',
}

export default function LogPage() {
  const [knocks, setKnocks] = useState<KnockRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('today')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterResult, setFilterResult] = useState<string | 'all'>('all')

  // Get date range bounds
  const getDateBounds = () => {
    const start = new Date(selectedDate)
    const end = new Date(selectedDate)
    
    if (dateRange === 'today') {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (dateRange === 'yesterday') {
      start.setDate(start.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      end.setDate(end.getDate() - 1)
      end.setHours(23, 59, 59, 999)
    } else if (dateRange === 'week') {
      start.setDate(start.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }
    
    return { start, end }
  }

  // Load knocks
  useEffect(() => {
    const loadKnocks = async () => {
      setLoading(true)
      const { start, end } = getDateBounds()
      
      try {
        const { data, error } = await supabase
          .from('knocks')
          .select('*')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .order('created_at', { ascending: false })

        if (error) throw error
        setKnocks(data || [])
      } catch (err) {
        console.error('Error loading knocks:', err)
        setKnocks([])
      } finally {
        setLoading(false)
      }
    }

    loadKnocks()
  }, [dateRange, selectedDate])

  // Navigate dates
  const goToPrevDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
    setDateRange('custom')
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    if (newDate <= new Date()) {
      setSelectedDate(newDate)
      setDateRange('custom')
    }
  }

  const goToToday = () => {
    setSelectedDate(new Date())
    setDateRange('today')
  }

  // Filter knocks
  const filteredKnocks = filterResult === 'all' 
    ? knocks 
    : knocks.filter(k => k.result === filterResult)

  // Stats
  const stats = {
    total: knocks.length,
    signedUp: knocks.filter(k => k.result === 'signed_up').length,
    notHome: knocks.filter(k => k.result === 'not_home').length,
    notInterested: knocks.filter(k => k.result === 'not_interested').length,
    callback: knocks.filter(k => k.result === 'callback').length,
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          📋 Knock Log
        </div>
      </div>

      {/* Date Navigation */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        borderRadius: '0.75rem',
        padding: '0.75rem',
        marginBottom: '1rem'
      }}>
        <button 
          onClick={goToPrevDay}
          style={{ 
            background: 'var(--bg-card)', 
            border: 'none', 
            borderRadius: '0.5rem',
            padding: '0.5rem',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: '1rem' }}>
            {formatDate(selectedDate)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        
        <button 
          onClick={goToNextDay}
          disabled={selectedDate.toDateString() === new Date().toDateString()}
          style={{ 
            background: 'var(--bg-card)', 
            border: 'none', 
            borderRadius: '0.5rem',
            padding: '0.5rem',
            color: selectedDate.toDateString() === new Date().toDateString() ? 'var(--text-secondary)' : 'var(--text-primary)',
            cursor: selectedDate.toDateString() === new Date().toDateString() ? 'not-allowed' : 'pointer',
            opacity: selectedDate.toDateString() === new Date().toDateString() ? 0.5 : 1
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Quick Date Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={goToToday}
          style={{
            flex: 1,
            background: dateRange === 'today' ? 'var(--accent)' : 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontWeight: dateRange === 'today' ? 600 : 400
          }}
        >
          Today
        </button>
        <button
          onClick={() => { setDateRange('yesterday'); setSelectedDate(new Date(Date.now() - 86400000)) }}
          style={{
            flex: 1,
            background: dateRange === 'yesterday' ? 'var(--accent)' : 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontWeight: dateRange === 'yesterday' ? 600 : 400
          }}
        >
          Yesterday
        </button>
        <button
          onClick={() => setDateRange('week')}
          style={{
            flex: 1,
            background: dateRange === 'week' ? 'var(--accent)' : 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontWeight: dateRange === 'week' ? 600 : 400
          }}
        >
          Last 7 Days
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '0.75rem', 
          padding: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Total</div>
        </div>
        <div style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '0.75rem', 
          padding: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{stats.signedUp}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Signed</div>
        </div>
        <div style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '0.75rem', 
          padding: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6b7280' }}>{stats.notHome}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Not Home</div>
        </div>
        <div style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '0.75rem', 
          padding: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{stats.callback}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Callback</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '0.375rem', 
        marginBottom: '1rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        <button
          onClick={() => setFilterResult('all')}
          style={{
            background: filterResult === 'all' ? 'var(--accent)' : 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '1rem',
            padding: '0.375rem 0.75rem',
            fontSize: '0.7rem',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap'
          }}
        >
          All
        </button>
        {Object.entries(RESULT_LABELS).map(([result, label]) => (
          <button
            key={result}
            onClick={() => setFilterResult(result)}
            style={{
              background: filterResult === result ? RESULT_COLORS[result] : 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '1rem',
              padding: '0.375rem 0.75rem',
              fontSize: '0.7rem',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap'
            }}
          >
            {label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Knock List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          Loading...
        </div>
      ) : filteredKnocks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem', 
          color: 'var(--text-secondary)',
          background: 'var(--bg-secondary)',
          borderRadius: '1rem'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚪</div>
          <div>No knocks recorded for this period</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredKnocks.map((knock) => (
            <div 
              key={knock.id}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '0.75rem',
                padding: '0.875rem',
                borderLeft: `4px solid ${RESULT_COLORS[knock.result] || '#666'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ 
                    fontWeight: 600, 
                    color: RESULT_COLORS[knock.result],
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem'
                  }}>
                    {RESULT_LABELS[knock.result] || knock.result}
                  </div>
                  {knock.address && (
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <MapPin size={12} />
                      {knock.address}
                    </div>
                  )}
                  {knock.notes && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      marginTop: '0.25rem'
                    }}>
                      "{knock.notes}"
                    </div>
                  )}
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <Clock size={10} />
                  {formatTime(knock.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom padding */}
      <div style={{ height: '2rem' }} />
    </div>
  )
}
