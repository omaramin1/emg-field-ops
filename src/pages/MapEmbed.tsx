import { useState, useEffect, useRef } from 'react'
import { Plus, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { createKnock, subscribeToKnocks, getTodaysKnocks, KnockResult } from '../lib/knocks'
import { useAuthStore } from '../stores/authStore'
import { reverseGeocode, formatAccuracy, getAccuracyRating } from '../lib/gps'

const RESULT_COLORS: Record<KnockResult, string> = {
  not_home: '#6b7280',
  not_interested: '#ef4444',
  signed_up: '#10b981',
  doesnt_qualify: '#f59e0b',
  wrong_address: '#8b5cf6',
  callback: '#3b82f6',
}

const RESULT_LABELS: Record<KnockResult, string> = {
  not_home: 'Not Home',
  not_interested: 'Not Interested',
  signed_up: 'Signed Up! ✓',
  doesnt_qualify: "Doesn't Qualify",
  wrong_address: 'Wrong Address',
  callback: 'Callback',
}

export default function MapEmbed() {
  const [position, setPosition] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'error'>('acquiring')
  const [showAddKnock, setShowAddKnock] = useState(false)
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
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        })
        setGpsStatus('locked')
      },
      (err) => {
        console.error('GPS error:', err)
        setGpsStatus('error')
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    )

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
    }
  }, [])

  // Load knocks
  useEffect(() => {
    getTodaysKnocks().then(setKnocks)
  }, [])

  // Subscribe to real-time
  useEffect(() => {
    const unsub = subscribeToKnocks(
      (newKnock) => setKnocks(prev => [newKnock, ...prev]),
      (updated) => setKnocks(prev => prev.map(k => k.id === updated.id ? updated : k)),
      (deletedId) => setKnocks(prev => prev.filter(k => k.id !== deletedId))
    )
    return unsub
  }, [])

  // Open knock panel
  const openKnockPanel = async () => {
    setShowAddKnock(true)
    setDetectedAddress('')
    if (position) {
      setIsLoadingAddress(true)
      try {
        const addr = await reverseGeocode(position.lat, position.lng)
        setDetectedAddress(addr || '')
      } catch (e) {
        console.error('Geocode error:', e)
      }
      setIsLoadingAddress(false)
    }
  }

  // Submit knock
  const submitKnock = async () => {
    if (!position || !selectedResult) return
    setIsSubmitting(true)

    try {
      const knock = await createKnock({
        position: { lat: position.lat, lng: position.lng, accuracy: position.accuracy, timestamp: Date.now() },
        result: selectedResult,
        notes: knockNotes || undefined,
        canvasserId,
        canvasserName,
        address: detectedAddress || undefined
      })

      if (knock) {
        setShowAddKnock(false)
        setSelectedResult(null)
        setKnockNotes('')
        setToast({ message: `✓ ${RESULT_LABELS[selectedResult]} logged!`, type: 'success' })
        setTimeout(() => setToast(null), 3000)
      }
    } catch (e) {
      setToast({ message: '⚠️ Failed to save', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    }
    setIsSubmitting(false)
  }

  const stats = {
    total: knocks.length,
    signedUp: knocks.filter(k => k.result === 'signed_up').length,
  }

  // Google Maps embed URL
  const mapUrl = position 
    ? `https://www.google.com/maps?q=${position.lat},${position.lng}&z=18&output=embed`
    : `https://www.google.com/maps?q=37.05,-76.3&z=15&output=embed`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 5rem)' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', padding: '1rem 1.5rem', borderRadius: '0.75rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 1000, fontWeight: 600
        }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-primary)', borderBottom: '1px solid var(--bg-card)' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
          Today: {stats.total} knocks · {stats.signedUp} signed
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          color: gpsStatus === 'locked' ? 'var(--success)' : gpsStatus === 'error' ? 'var(--danger)' : 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: '0.25rem'
        }}>
          {gpsStatus === 'acquiring' && <><Loader2 size={12} className="animate-spin" /> Acquiring GPS...</>}
          {gpsStatus === 'locked' && position && (
            <><CheckCircle size={12} /> GPS: ±{formatAccuracy(position.accuracy)} ({getAccuracyRating(position.accuracy)})</>
          )}
          {gpsStatus === 'error' && <><AlertCircle size={12} /> GPS Error</>}
        </div>
      </div>

      {/* Google Maps Embed */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          src={mapUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        
        {/* Knock markers overlay */}
        {knocks.length > 0 && (
          <div style={{
            position: 'absolute', top: '0.5rem', left: '0.5rem',
            background: 'rgba(0,0,0,0.75)', borderRadius: '0.5rem',
            padding: '0.5rem', fontSize: '0.7rem', color: 'white'
          }}>
            📍 {knocks.length} knocks today
          </div>
        )}
      </div>

      {/* Add Knock Button */}
      {!showAddKnock && (
        <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderTop: '1px solid var(--bg-card)' }}>
          <button
            onClick={openKnockPanel}
            disabled={gpsStatus !== 'locked'}
            className="btn btn-primary"
            style={{ 
              width: '100%', padding: '1rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              fontSize: '1rem', opacity: gpsStatus !== 'locked' ? 0.5 : 1
            }}
          >
            <Plus size={20} /> Log Door Knock
          </button>
        </div>
      )}

      {/* Add Knock Panel */}
      {showAddKnock && (
        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>Log This Door</div>
            <button onClick={() => { setShowAddKnock(false); setSelectedResult(null) }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>×</button>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>📍 Address:</div>
            {isLoadingAddress ? (
              <div style={{ background: 'var(--bg-card)', borderRadius: '0.5rem', padding: '0.75rem', color: 'var(--text-secondary)' }}>
                <Loader2 size={14} className="animate-spin" style={{ display: 'inline', marginRight: '0.5rem' }} />
                Detecting...
              </div>
            ) : (
              <input
                type="text"
                value={detectedAddress}
                onChange={(e) => setDetectedAddress(e.target.value)}
                placeholder="Enter address..."
                style={{
                  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bg-card)',
                  borderRadius: '0.5rem', padding: '0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem'
                }}
              />
            )}
          </div>

          {/* Result Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Result:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {Object.entries(RESULT_LABELS).map(([result, label]) => (
                <button
                  key={result}
                  onClick={() => setSelectedResult(result as KnockResult)}
                  style={{
                    background: selectedResult === result ? RESULT_COLORS[result as KnockResult] : 'var(--bg-card)',
                    border: `2px solid ${selectedResult === result ? RESULT_COLORS[result as KnockResult] : 'var(--bg-card)'}`,
                    borderRadius: '0.5rem', padding: '0.75rem', color: 'white',
                    fontSize: '0.8rem', fontWeight: 500
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notes:</div>
            <textarea
              value={knockNotes}
              onChange={(e) => setKnockNotes(e.target.value)}
              placeholder="Optional notes..."
              style={{
                width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bg-card)',
                borderRadius: '0.5rem', padding: '0.75rem', color: 'var(--text-primary)',
                fontSize: '0.875rem', resize: 'none', height: '60px'
              }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={submitKnock}
            disabled={!selectedResult || isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: !selectedResult ? 0.5 : 1 }}
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><CheckCircle size={18} /> Save Knock</>}
          </button>
        </div>
      )}
    </div>
  )
}
