// Manager-facing analytics dashboard
// Shows area performance for future planning

import { BarChart3, MapPin, Clock, TrendingUp, AlertTriangle } from 'lucide-react'

export default function AnalyticsPage() {
  // Mock data - would come from dataStore calculations
  const territoryStats = [
    { 
      name: 'Langley Village', 
      knocked: 67, 
      total: 80, 
      signups: 8, 
      conversionRate: 11.9,
      closeRate: 53,
      bestTime: '10am-12pm',
      topObjection: 'Not interested'
    },
    { 
      name: 'Sulik Park', 
      knocked: 32, 
      total: 40, 
      signups: 5, 
      conversionRate: 15.6,
      closeRate: 62,
      bestTime: '4pm-6pm',
      topObjection: 'Need to ask spouse'
    },
    { 
      name: 'Semple Farm', 
      knocked: 0, 
      total: 50, 
      signups: 0, 
      conversionRate: 0,
      closeRate: 0,
      bestTime: 'No data',
      topObjection: 'No data'
    },
  ]

  const overallStats = {
    totalKnocked: 99,
    totalSignups: 13,
    avgConversion: 13.1,
    avgCloseRate: 57,
    bestDay: 'Tuesday',
    bestTime: '10am-12pm',
    worstTime: '2pm-4pm'
  }

  const hotZones = [
    { area: 'Collier Dr block', signups: 4, rate: '18%' },
    { area: 'Main entrance area', signups: 3, rate: '15%' },
  ]

  const coldZones = [
    { area: 'Back section', signups: 0, rate: '0%', reason: 'High no-answer rate' },
  ]

  const objectionBreakdown = [
    { objection: 'Not interested', count: 23, pct: 42 },
    { objection: 'Already have it', count: 12, pct: 22 },
    { objection: 'Need to ask spouse', count: 11, pct: 20 },
    { objection: 'Is this a scam?', count: 5, pct: 9 },
    { objection: 'No time', count: 4, pct: 7 },
  ]

  return (
    <div>
      <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        📊 Area Analytics
      </div>

      {/* Overall Stats */}
      <div className="card">
        <div className="card-title">Overall Performance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)' }}>
              {overallStats.avgConversion}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Conversion Rate
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)' }}>
              {overallStats.avgCloseRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Close Rate
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {overallStats.bestDay}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Best Day
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {overallStats.bestTime}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Best Time
            </div>
          </div>
        </div>
      </div>

      {/* Territory Breakdown */}
      <div className="card">
        <div className="card-title">
          <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Territory Performance
        </div>
        
        {territoryStats.map((territory, index) => (
          <div 
            key={territory.name}
            style={{
              padding: '0.75rem 0',
              borderBottom: index < territoryStats.length - 1 ? '1px solid var(--bg-card)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 600 }}>{territory.name}</div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: territory.conversionRate > 12 ? 'var(--accent)' : 'var(--text-secondary)'
              }}>
                {territory.conversionRate > 0 ? `${territory.conversionRate}% conv` : 'No data'}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ 
                flex: 1, 
                background: 'var(--bg-card)', 
                borderRadius: '4px', 
                overflow: 'hidden',
                height: '8px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(territory.knocked / territory.total) * 100}%`,
                  background: 'var(--accent)'
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {territory.knocked}/{territory.total}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>🎯 {territory.signups} signups</span>
              {territory.closeRate > 0 && <span>📈 {territory.closeRate}% close</span>}
              {territory.bestTime !== 'No data' && <span>⏰ {territory.bestTime}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Hot & Cold Zones */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div className="card-title" style={{ color: 'var(--accent)' }}>
            🔥 Hot Zones
          </div>
          {hotZones.map(zone => (
            <div key={zone.area} style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 500 }}>{zone.area}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{zone.signups} signups · {zone.rate}</div>
            </div>
          ))}
        </div>
        
        <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div className="card-title" style={{ color: '#f87171' }}>
            ❄️ Cold Zones
          </div>
          {coldZones.map(zone => (
            <div key={zone.area} style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 500 }}>{zone.area}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{zone.reason}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Objection Analysis */}
      <div className="card">
        <div className="card-title">
          <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Objection Breakdown
        </div>
        
        {objectionBreakdown.map(obj => (
          <div key={obj.objection} style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem' }}>{obj.objection}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {obj.count} ({obj.pct}%)
              </span>
            </div>
            <div style={{ 
              height: '6px', 
              background: 'var(--bg-card)', 
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${obj.pct}%`,
                background: obj.pct > 30 ? '#f87171' : obj.pct > 15 ? '#fbbf24' : 'var(--accent)'
              }} />
            </div>
          </div>
        ))}
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: 'var(--bg-card)', 
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <strong>💡 Insight:</strong> "Not interested" is high — reps may need stronger opening hooks. 
          Consider A/B testing different openers.
        </div>
      </div>

      {/* Timing Heatmap */}
      <div className="card">
        <div className="card-title">
          <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Best Knock Times
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {[
            { time: '9-10am', score: 60 },
            { time: '10-11am', score: 85 },
            { time: '11-12pm', score: 90 },
            { time: '12-1pm', score: 40 },
            { time: '1-2pm', score: 35 },
            { time: '2-3pm', score: 30 },
            { time: '3-4pm', score: 55 },
            { time: '4-5pm', score: 75 },
            { time: '5-6pm', score: 80 },
            { time: '6-7pm', score: 70 },
            { time: '7-8pm', score: 45 },
            { time: '8pm+', score: 15 },
          ].map(slot => (
            <div 
              key={slot.time}
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
                fontSize: '0.75rem',
                background: `rgba(16, 185, 129, ${slot.score / 100 * 0.5})`,
                border: slot.score > 75 ? '1px solid var(--accent)' : 'none'
              }}
            >
              <div style={{ fontWeight: slot.score > 75 ? 600 : 400 }}>{slot.time}</div>
              <div style={{ opacity: 0.7 }}>{slot.score}%</div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          marginTop: '1rem', 
          fontSize: '0.75rem', 
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          Higher % = better conversion rate during that time
        </div>
      </div>

      {/* Predictions */}
      <div className="card">
        <div className="card-title">
          <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Recommended Next Territories
        </div>
        
        {[
          { name: 'Semple Farm', expected: '6-8 signups', reason: 'Similar to Sulik, fresh territory' },
          { name: 'Warwick Medallion', expected: '12-15 signups', reason: 'Largest park, high potential' },
          { name: 'Derby Run', expected: '8-10 signups', reason: 'VB has good demo match' },
        ].map((rec, index) => (
          <div 
            key={rec.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 0',
              borderBottom: index < 2 ? '1px solid var(--bg-card)' : 'none'
            }}
          >
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}>
              {index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{rec.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rec.reason}</div>
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'var(--accent)',
              fontWeight: 600
            }}>
              {rec.expected}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
