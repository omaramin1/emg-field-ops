import { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api'
import { Plus, CheckCircle, Loader2, X, Home, UserX, ThumbsDown, HelpCircle, Phone, MapPin, Navigation } from 'lucide-react'
import { createKnock, subscribeToKnocks, getTodaysKnocks, KnockResult } from '../lib/knocks'
import { useAuthStore } from '../stores/authStore'
import { reverseGeocode } from '../lib/gps'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

const RESULT_OPTIONS: { result: KnockResult; label: string; icon: any; color: string; shortLabel: string; markerColor: string }[] = [
  { result: 'not_home', label: 'Not Home', shortLabel: 'Not Home', icon: Home, color: '#6b7280', markerColor: '#9ca3af' },
  { result: 'not_interested', label: 'Not Interested', shortLabel: 'No Interest', icon: ThumbsDown, color: '#ef4444', markerColor: '#f87171' },
  { result: 'signed_up', label: 'Signed Up!', shortLabel: 'SIGNED UP', icon: CheckCircle, color: '#10b981', markerColor: '#34d399' },
  { result: 'doesnt_qualify', label: "Doesn't Qualify", shortLabel: 'No Qualify', icon: UserX, color: '#f59e0b', markerColor: '#fbbf24' },
  { result: 'callback', label: 'Callback', shortLabel: 'Callback', icon: Phone, color: '#3b82f6', markerColor: '#60a5fa' },
  { result: 'wrong_address', label: 'Pending Enrollment', shortLabel: 'Pending', icon: HelpCircle, color: '#8b5cf6', markerColor: '#a78bfa' },
]

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = { lat: 37.05, lng: -76.3 }

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8b8b8b' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e4166' }] },
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a3a1a' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
}

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
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [isFollowing, setIsFollowing] = useState(true)
  
  const watchId = useRef<number | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const { currentRep } = useAuthStore()
  const canvasserId = currentRep?.id || '00000000-0000-0000-0000-000000000001'
  const canvasserName = currentRep?.name || 'Unknown'

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  // Watch GPS
  useEffect(() => {
    setGpsStatus('acquiring')
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }
        setPosition(newPos)
        setGpsStatus('locked')
        if (isFollowing) {
          setMapCenter({ lat: newPos.lat, lng: newPos.lng })
        }
      },
      (err) => { console.error('GPS error:', err); setGpsStatus('error') },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    )
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current) }
  }, [isFollowing])

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

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onMapDrag = useCallback(() => {
    setIsFollowing(false)
  }, [])

  const recenterMap = () => {
    if (position && mapRef.current) {
      mapRef.current.panTo({ lat: position.lat, lng: position.lng })
      setIsFollowing(true)
    }
  }

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

  const getMarkerIcon = (result: KnockResult): google.maps.Symbol => {
    const opt = RESULT_OPTIONS.find(o => o.result === result)
    const color = opt?.markerColor || '#9ca3af'
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: result === 'signed_up' ? 10 : 7,
    }
  }

  if (loadError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#ef4444' }}>
        Map failed to load
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 5rem)', background: '#0f172a' }}>
      {/* Toast */}
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
          {/* Status bar */}
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
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={18}
              options={mapOptions}
              onLoad={onMapLoad}
              onDragStart={onMapDrag}
            >
              {/* User position marker */}
              {position && (
                <>
                  <Circle
                    center={{ lat: position.lat, lng: position.lng }}
                    radius={position.accuracy}
                    options={{
                      fillColor: '#3b82f6',
                      fillOpacity: 0.15,
                      strokeColor: '#3b82f6',
                      strokeOpacity: 0.3,
                      strokeWeight: 1,
                    }}
                  />
                  <Marker
                    position={{ lat: position.lat, lng: position.lng }}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: '#3b82f6',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 3,
                      scale: 8,
                    }}
                    zIndex={1000}
                  />
                </>
              )}

              {/* Knock markers */}
              {knocks.map((knock) => (
                <Marker
                  key={knock.id}
                  position={{ lat: knock.lat, lng: knock.lng }}
                  icon={getMarkerIcon(knock.result)}
                  title={`${knock.result}${knock.address ? ` - ${knock.address}` : ''}`}
                />
              ))}
            </GoogleMap>

            {/* Recenter button */}
            {!isFollowing && position && (
              <button
                onClick={recenterMap}
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: '2px solid var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  zIndex: 100,
                }}
              >
                <Navigation size={24} />
              </button>
            )}
          </div>

          {/* BIG knock button */}
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
        /* KNOCK MODE */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f172a', overflow: 'hidden' }}>
          {/* Header */}
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

          {/* Result buttons */}
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

          {/* Notes */}
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
