import { useState, useEffect, useRef } from 'react'
import { Plus, CheckCircle, Loader2, AlertCircle, X, Home, UserX, ThumbsDown, HelpCircle, Phone, MapPin } from 'lucide-react'
import { createKnock, subscribeToKnocks, getTodaysKnocks, KnockResult } from '../lib/knocks'
import { useAuthStore } from '../stores/authStore'
import { reverseGeocode, formatAccuracy, getAccuracyRating } from '../lib/gps'

const RESULT_OPTIONS: { result: KnockResult; label: string; icon: any; color: string; shortLabel: string }[] = [
  { result: 'not_home', label: 'Not Home', shortLabel: 'Not Home', icon: Home, color: '#6b7280' },
  { result: 'not_interested', label: 'Not Interested', shortLabel: 'No Interest', icon: ThumbsDown, color: '#ef4444' },
  { result: 'signed_up', label: 'Signed Up!', shortLabel: 'SIGNED UP', icon: CheckCircle, color: '#10b981' },
  { result: 'doesnt_qualify', label: "Doesn't Qualify", shortLabel: 'No Qualify', icon: UserX, color: '#f59e0b' },
  { result: 'callback', label: 'Callback', shortLabel: 'Callback', icon: Phone, color: '#3b82f6' },
  { result: 'wrong_address', label: 'Wrong Address', shortLabel: 'Wrong Addr', icon: HelpCircle, color: '#8b5cf6' },
]

export default function MapEmbed() {
  const [position, setPosition] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'error'>('acquiring')
  const [mode, setMode] = useState<'map' | 'knock'>('map')
  const [selectedResult, setSelectedResult] = useState<KnockResult | null>(null)
  const [knockNotes, setKnockNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedAddress, setDetectedAddress] = useState('')
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [knocks, setKnocks] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const watchId = useRef<number | null>(null)

  const { currentRep } = useAuthStore()
  const canvasserId = currentRep?.id || '00000000-0000-0000-0000-000000000001'
  const canvasserName = currentRep?.name || 'Unknown'

  // Watch GPS
  useEffect(() => {
    setGpsStatus('acquiring')
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy })
        setGpsStatus('locked')
      },
      (err) => { console.error('GPS error:', err); setGpsStatus('error') },
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current) }
  }, [])

  // Load knocks & subscribe
  useEffect(() => { getTodaysKnocks().then(setKnocks) }, [])
  useEffect(() => {
    const unsub = subscribeToKnocks(
      (n) => setKnocks(prev => [n, ...prev]),
      (u) => setKnocks(prev => prev.map(k => k.id === u.id ? u : k)),
      (id) => setKnocks(prev => prev.filter(k => k.id !== id))
    )
    return unsub
  }, [])

  // Open knock mode
  const openKnockMode = async () => {
    setMode('knock')
    setSelectedResult(null)
    setKnockNotes('')
    setDetectedAddress('')
    if (position) {
      setIsLoadingAddress(true)
      try {
        const addr = await reverseGeocode(position.lat, position.lng)
        setDetectedAddress(addr || '')
      } catch (e) { console.error('Geocode error:', e) }
      setIsLoadingAddress(false)
    }
  }

  // Quick knock - one tap
  const quickKnock = async (result: KnockResult) => {
    if (!position) return
    setSelectedResult(result)
    setIsSubmitting(true)

    try {
      const knock = await createKnock({
        position: { lat: position.lat, lng: position.lng, accuracy: position.accuracy, timestamp: Date.now() },
        result,
        notes: knockNotes || undefined,
        canvasserId,
        canvasserName,
        address: detectedAddress || undefined
      })

      if (knock) {
        const opt = RESULT_OPTIONS.find(o => o.result === result)
        setToast({ message: `✓ ${opt?.shortLabel || result}`, type: 'success' })
        setTimeout(() => setToast(null), 2000)
        setMode('map')
        setSelectedResult(null)
        setKnockNotes('')
      }
    } catch (e) {
      setToast({ message: '⚠️ Failed', type: 'error' })
      setTimeout(() => setToast(null), 2000)
    }
    setIsSubmitting(false)
  }

  const stats = {
    total: knocks.length,
    signedUp: knocks.filter(k => k.result === 'signed_up').length,
  }

  const mapUrl = position 
    ? `https://www.google.com/maps?q=${position.lat},${position.lng}&z=18&output=embed`
    : `https://www.google.com/maps?q=37.05,-76.3&z=15&output=embed`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 5rem)', background: '#0f172a' }}>
      {/* Toast - top center */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', padding: '0.75rem 1.5rem', borderRadius: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 1000, fontWeight: 700, fontSize: '1rem'
        }}>
          {toast.message}
        </div>
      )}

      {mode === 'map' ? (
        <>
          {/* Mini status bar */}
          <div style={{ 
            padding: '0.5rem 1rem', 
            background: 'var(--bg-primary)', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--bg-card)'
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              🔥 {stats.signedUp} signed · {stats.total} total
            </div>
            <div style={{ 
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '1rem',
              background: gpsStatus === 'locked' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              color: gpsStatus === 'locked' ? '#10b981' : '#ef4444'
            }}>
              {gpsStatus === 'locked' && position ? `±${Math.round(position.accuracy)}m` : gpsStatus === 'acquiring' ? '...' : '⚠️'}
            </div>
          </div>

          {/* Map */}
          <div style={{ flex: 1, position: 'relative' }}>
            <iframe
              src={mapUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* BIG knock button - thumb friendly at bottom */}
          <div style={{ padding: '1rem', paddingBottom: '1.5rem', background: 'var(--bg-primary)' }}>
            <button
              onClick={openKnockMode}
              disabled={gpsStatus !== 'locked'}
              style={{ 
                width: '100%',
                padding: '1.25rem',
                fontSize: '1.25rem',
                fontWeight: 700,
                background: gpsStatus === 'locked' ? '#10b981' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: gpsStatus === 'locked' ? '0 4px 20px rgba(16,185,129,0.4)' : 'none',
                opacity: gpsStatus === 'locked' ? 1 : 0.5
              }}
            >
              <Plus size={28} strokeWidth={3} /> LOG KNOCK
            </button>
          </div>
        </>
      ) : (
        /* KNOCK MODE - Full screen, one-handed, fits viewport */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f172a', overflow: 'hidden' }}>
          {/* Header with address & close */}
          <div style={{ 
            padding: '1rem', 
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--bg-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  LOGGING AT:
                </div>
                {isLoadingAddress ? (
                  <div style={{ color: 'var(--text-secondary)' }}>Detecting address...</div>
                ) : (
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {detectedAddress || 'Address unavailable'}
                  </div>
                )}
              </div>
              <button
                onClick={() => setMode('map')}
                style={{
                  background: 'var(--bg-card)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)'
                }}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Result buttons - compact grid that fits on screen */}
          <div style={{ 
            padding: '0.75rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem',
          }}>
            {RESULT_OPTIONS.map(({ result, shortLabel, icon: Icon, color }) => (
              <button
                key={result}
                onClick={() => quickKnock(result)}
                disabled={isSubmitting}
                style={{
                  background: selectedResult === result ? color : 'var(--bg-card)',
                  border: `2px solid ${color}`,
                  borderRadius: '0.75rem',
                  padding: '0.875rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                <Icon size={24} color={selectedResult === result ? 'white' : color} />
                <span style={{ color: selectedResult === result ? 'white' : color }}>
                  {shortLabel}
                </span>
              </button>
            ))}
          </div>

          {/* Optional notes - compact */}
          <div style={{ padding: '0.5rem 0.75rem 0.75rem', background: 'var(--bg-secondary)' }}>
            <input
              type="text"
              value={knockNotes}
              onChange={(e) => setKnockNotes(e.target.value)}
              placeholder="+ Add note (optional)"
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '2px solid var(--bg-card)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
