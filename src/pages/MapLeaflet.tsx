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

  // Submit knock
  const submitKnock = async () => {
    if (!position || !selectedResult || !currentRep) return
    setIsSubmitting(true)

    const knock = await createKnock({
      position: { lat: position[0], lng: position[1], accuracy, timestamp: Date.now() },
      result: selectedResult,
      canvasserId: currentRep.id,
      canvasserName: currentRep.name,
    })

    setIsSubmitting(false)
    if (knock) {
      setToast(`✓ ${RESULT_LABELS[selectedResult]} logged!`)
      setTimeout(() => setToast(null), 2000)
      setShowKnockPanel(false)
      setSelectedResult(null)
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
    <div style={{ height: 'calc(100vh - 5rem)', display: 'flex', flexDirection: 'column' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          background: '#10b981', color: 'white', padding: '1rem 1.5rem',
          borderRadius: '0.75rem', zIndex: 1000, fontWeight: 600
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Today: {stats.total} knocks · {stats.signed} signed
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: gpsStatus === 'locked' ? 'var(--success)' : gpsStatus === 'error' ? 'var(--danger)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '0.25rem'
            }}>
              {gpsStatus === 'acquiring' && <><Loader2 size={12} className="animate-spin" /> Acquiring GPS...</>}
              {gpsStatus === 'locked' && <><CheckCircle size={12} /> GPS: ±{accuracy.toFixed(0)}m</>}
              {gpsStatus === 'error' && <><AlertCircle size={12} /> GPS Error</>}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={position || [37.541, -77.436]}
          zoom={position ? 17 : 10}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
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

        {/* Center button */}
        <button
          onClick={centerOnUser}
          disabled={!position}
          style={{
            position: 'absolute', bottom: '5rem', right: '1rem', zIndex: 1000,
            background: 'var(--bg-secondary)', border: 'none', borderRadius: '0.5rem',
            padding: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          <Target size={20} color={position ? 'var(--text-primary)' : 'var(--text-secondary)'} />
        </button>
      </div>

      {/* Log Knock Button */}
      {!showKnockPanel && (
        <div style={{ padding: '1rem', background: 'var(--bg-primary)' }}>
          <button
            onClick={() => setShowKnockPanel(true)}
            disabled={gpsStatus !== 'locked'}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: gpsStatus !== 'locked' ? 0.5 : 1 }}
          >
            <Plus size={20} /> Log Door Knock
          </button>
        </div>
      )}

      {/* Knock Panel */}
      {showKnockPanel && (
        <div style={{ padding: '1rem', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600 }}>Log This Door</div>
            <button onClick={() => { setShowKnockPanel(false); setSelectedResult(null) }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {Object.entries(RESULT_LABELS).map(([result, label]) => (
              <button
                key={result}
                onClick={() => setSelectedResult(result as KnockResult)}
                style={{
                  background: selectedResult === result ? RESULT_COLORS[result] : 'var(--bg-card)',
                  border: `2px solid ${RESULT_COLORS[result]}`,
                  borderRadius: '0.5rem', padding: '0.75rem', color: 'white', fontSize: '0.8rem', fontWeight: 500
                }}
              >{label}</button>
            ))}
          </div>
          <button
            onClick={submitKnock}
            disabled={!selectedResult || isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', opacity: !selectedResult ? 0.5 : 1 }}
          >
            {isSubmitting ? 'Saving...' : '✓ Save Knock'}
          </button>
        </div>
      )}
    </div>
  )
}
