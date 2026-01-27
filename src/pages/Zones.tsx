import { useState } from 'react'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import grids from '../data/grids.json'

export default function ZonesPage() {
  const [showTop, setShowTop] = useState(25)

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank')
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          🎯 Hot Blocks (1-Mile)
        </div>
      </div>

      {/* Explanation */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--bg-secondary) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        fontSize: '0.8rem'
      }}>
        <strong style={{ color: 'var(--accent)' }}>1-mile blocks</strong> where competitors closed deals.
        <br />
        <span style={{ color: 'var(--text-secondary)' }}>Proven demand — tap the block to open in Google Maps.</span>
      </div>

      {/* Show more toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[25, 50, 100].map(n => (
          <button
            key={n}
            onClick={() => setShowTop(n)}
            style={{
              flex: 1,
              background: showTop === n ? 'var(--accent)' : 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: showTop === n ? 600 : 400
            }}
          >
            Top {n}
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {grids.slice(0, showTop).map((grid: any) => (
          <div 
            key={grid.gridId}
            onClick={() => openInMaps(grid.lat, grid.lng)}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '0.75rem',
              padding: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              borderLeft: `4px solid ${
                grid.rank <= 10 ? '#10b981' : 
                grid.rank <= 25 ? '#3b82f6' : 
                grid.rank <= 50 ? '#f59e0b' : '#6b7280'
              }`
            }}
          >
            {/* Rank */}
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.5rem',
              background: grid.rank <= 10 ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: grid.rank <= 9 ? '1.25rem' : '1rem',
              color: grid.rank <= 10 ? 'var(--accent)' : 'var(--text-primary)'
            }}>
              {grid.rank}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {grid.city}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {grid.zip} · {grid.lat.toFixed(3)}, {grid.lng.toFixed(3)}
              </div>
            </div>

            {/* Deals Count */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '1.25rem',
                color: grid.competitorDeals >= 300 ? '#10b981' : 
                       grid.competitorDeals >= 200 ? '#3b82f6' : 'var(--text-primary)'
              }}>
                {grid.competitorDeals}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                deals
              </div>
            </div>

            {/* Map Icon */}
            <div style={{ color: 'var(--text-secondary)' }}>
              <Navigation size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '0.75rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
          {grids.reduce((sum: number, g: any) => sum + g.competitorDeals, 0).toLocaleString()}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          total competitor deals in {grids.length} hot blocks
        </div>
      </div>

      {/* Bottom padding */}
      <div style={{ height: '2rem' }} />
    </div>
  )
}
