import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Plus, Target, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createKnock, subscribeToKnocks, getTodaysKnocks, KnockResult } from '../lib/knocks'
import { useAuthStore } from '../stores/authStore'
import { KnockRecord } from '../lib/supabase'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const RESULT_COLORS: Record<string, string> = {
  not_home: '#6b7280',
  not_interested: '#ef4444',
  signed_up: '#10b981',
  doesnt_qualify: '#f59e0b',
  callback: '#3b82f6',
  wrong_address: '#8b5cf6',
}

const RESULT_LABELS: Record<string, string> = {
  not_home: 'Not Home',
  not_interested: 'Not Interested',
  signed_up: 'Signed Up!',
  doesnt_qualify: "Doesn't Qualify",
  callback: 'Callback',
  wrong_address: 'Pending',
}

// Custom colored marker
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// Component to handle map center updates
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}

export default function MapLeaflet() {
  const { currentRep } = useAuthStore()
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [accuracy, setAccuracy] = useState<number>(0)
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'error'>('acquiring')
  const [knocks, setKnocks] = useState<KnockRecord[]>([])
  const [showKnockPanel, setShowKnockPanel] = useState(false)
  const [selectedResult, setSelectedResult] = useState<KnockResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  // Position captured on tap

  // Watch GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude])
        setAccuracy(pos.coords.accuracy)
        setGpsStatus('locked')
      },
      (err) => {
        console.error('GPS error:', err)
        setGpsStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // Load knocks
  useEffect(() => {
    getTodaysKnocks().then(setKnocks)
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToKnocks(
      (newKnock) => setKnocks(prev => [newKnock, ...prev]),
      (updatedKnock) => setKnocks(prev => prev.map(k => k.id === updatedKnock.id ? updatedKnock : k)),
      (deletedId) => setKnocks(prev => prev.filter(k => k.id !== deletedId))
    )
    return unsubscribe
  }, [])

  // One-tap logging - capture GPS + address + save all at once
  const quickLog = async (result: KnockResult) => {
    if (!position || !currentRep || isSubmitting) return
    setIsSubmitting(true)
    setSelectedResult(result)

    // Capture position NOW
    const lat = position[0]
    const lng = position[1]
    const acc = accuracy

    // Get address
    let address = ''
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      const data = await response.json()
      address = data.display_name?.split(',').slice(0, 3).join(',') || ''
    } catch (e) {
      console.error('Address lookup failed:', e)
    }

    // Save knock
    const knock = await createKnock({
      position: { lat, lng, accuracy: acc, timestamp: Date.now() },
      result,
      canvasserId: currentRep.id,
      canvasserName: currentRep.name,
      address: address || undefined,
    })

    setIsSubmitting(false)
    setSelectedResult(null)
    
    if (knock) {
      setToast(`✓ ${RESULT_LABELS[result]} logged!`)
      setTimeout(() => setToast(null), 2000)
      setShowKnockPanel(false)
    }
  }

  const centerOnUser = () => {
    if (position && mapRef.current) {
      mapRef.current.setView(position, 17)
    }
  }

  const stats = {
    total: knocks.length,
    signed: knocks.filter(k => k.result === 'signed_up').length,
  }

  return (
    <div style={{ 
      height: 'calc(100dvh - 4.5rem)', 
      maxHeight: 'calc(100dvh - 4.5rem)',
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          background: '#10b981', color: 'white', padding: '0.75rem 1.25rem',
          borderRadius: '0.75rem', zIndex: 1000, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '0.875rem'
        }}>{toast}</div>
      )}

      {/* Advanced Header with better spacing */}
      <div style={{ 
        padding: '0.75rem 1rem', 
        background: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '60px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
            Today: {stats.total} knocks · {stats.signed} signed
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: gpsStatus === 'locked' ? 'var(--success)' : gpsStatus === 'error' ? 'var(--danger)' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            fontWeight: 500
          }}>
            {gpsStatus === 'acquiring' && <><Loader2 size={12} className="animate-spin" /> Acquiring GPS...</>}
            {gpsStatus === 'locked' && <><CheckCircle size={12} /> GPS: ±{accuracy.toFixed(0)}m</>}
            {gpsStatus === 'error' && <><AlertCircle size={12} /> GPS Error</>}
          </div>
        </div>
      </div>

      {/* Optimized Map Container */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <MapContainer
          center={position || [37.541, -77.436]}
          zoom={position ? 17 : 10}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />
          <MapController center={position} />
          
          {/* User position */}
          {position && (
            <>
              <Circle center={position} radius={accuracy} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15 }} />
              <Marker position={position} icon={L.divIcon({
                className: 'user-marker',
                html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(59,130,246,0.3);"></div>`,
                iconSize: [16, 16], iconAnchor: [8, 8]
              })} />
            </>
          )}

          {/* Knock markers */}
          {knocks.map(knock => (
            <Marker
              key={knock.id}
              position={[knock.lat, knock.lng]}
              icon={createColoredIcon(RESULT_COLORS[knock.result] || '#666')}
            >
              <Popup>
                <strong style={{ color: RESULT_COLORS[knock.result] }}>{RESULT_LABELS[knock.result]}</strong>
                {knock.address && <><br /><small>{knock.address}</small></>}
                <br /><small style={{ color: '#888' }}>{new Date(knock.created_at).toLocaleTimeString()}</small>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Optimized Control Buttons */}
        <div style={{
          position: 'absolute', 
          bottom: 'max(1rem, env(safe-area-inset-bottom))', 
          right: '1rem', 
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button
            onClick={centerOnUser}
            disabled={!position}
            style={{
              background: 'var(--bg-secondary)', 
              border: 'none', 
              borderRadius: '0.75rem',
              padding: '0.875rem', 
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              minWidth: '48px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
              transform: !position ? 'scale(0.95)' : 'scale(1)',
              opacity: !position ? 0.6 : 1
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = position ? 'scale(1)' : 'scale(0.95)'}
          >
            <Target size={20} color={position ? 'var(--text-primary)' : 'var(--text-secondary)'} />
          </button>
        </div>
      </div>

      {/* Advanced Log Knock Button */}
      {!showKnockPanel && (
        <div style={{ 
          padding: '1rem', 
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
        }}>
          <button
            onClick={() => setShowKnockPanel(true)}
            disabled={gpsStatus !== 'locked'}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1rem', 
              fontWeight: 600,
              minHeight: '56px',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: gpsStatus !== 'locked' ? 0.5 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <Plus size={20} /> Log Door Knock
          </button>
        </div>
      )}

      {/* Advanced Knock Panel */}
      {showKnockPanel && (
        <div style={{ 
          padding: '1rem', 
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '1rem',
              letterSpacing: '-0.01em'
            }}>Tap to Log</div>
            <button 
              onClick={() => { setShowKnockPanel(false); setSelectedResult(null) }} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-secondary)', 
                fontSize: '1.5rem',
                padding: '0.5rem',
                cursor: 'pointer',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >×</button>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '0.75rem'
          }}>
            {Object.entries(RESULT_LABELS).map(([result, label]) => (
              <button
                key={result}
                onClick={() => quickLog(result as KnockResult)}
                disabled={isSubmitting}
                style={{
                  background: selectedResult === result ? RESULT_COLORS[result] : 'var(--bg-card)',
                  border: `2px solid ${RESULT_COLORS[result]}`,
                  borderRadius: '0.75rem', 
                  padding: '1rem', 
                  color: 'white', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  opacity: isSubmitting ? 0.5 : 1,
                  minHeight: '56px',
                  cursor: isSubmitting ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >{isSubmitting && selectedResult === result ? '...' : label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
