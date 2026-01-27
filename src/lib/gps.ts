/**
 * High-Accuracy GPS Service
 * Designed for maximum precision in door-to-door canvassing
 */

export interface GPSPosition {
  lat: number
  lng: number
  accuracy: number // meters
  altitude?: number
  altitudeAccuracy?: number
  heading?: number
  speed?: number
  timestamp: number
}

export interface GPSError {
  code: number
  message: string
}

// Accuracy thresholds
const EXCELLENT_ACCURACY = 5    // meters - GPS lock
const GOOD_ACCURACY = 10        // meters - acceptable for pins
const ACCEPTABLE_ACCURACY = 20  // meters - warn user
const _MAX_ACCURACY = 50         // meters - require confirmation (reserved)

/**
 * Get current position with maximum accuracy
 * Uses multiple readings and takes the best one
 */
export async function getHighAccuracyPosition(
  maxWaitMs: number = 10000,
  minAccuracy: number = GOOD_ACCURACY
): Promise<GPSPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: 0, message: 'Geolocation not supported' })
      return
    }

    let bestPosition: GPSPosition | null = null
    let watchId: number | null = null
    let timeoutId: NodeJS.Timeout | null = null

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }

    // Timeout - return best position we got
    timeoutId = setTimeout(() => {
      cleanup()
      if (bestPosition) {
        resolve(bestPosition)
      } else {
        reject({ code: 3, message: 'GPS timeout - could not get accurate position' })
      }
    }, maxWaitMs)

    // Watch position for best reading
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos: GPSPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
          timestamp: position.timestamp
        }

        // Keep best reading
        if (!bestPosition || pos.accuracy < bestPosition.accuracy) {
          bestPosition = pos
        }

        // If we hit target accuracy, resolve immediately
        if (pos.accuracy <= minAccuracy) {
          cleanup()
          resolve(pos)
        }
      },
      (error) => {
        // Don't reject on error if we have a position - just keep trying
        if (!bestPosition) {
          cleanup()
          reject({
            code: error.code,
            message: getErrorMessage(error.code)
          })
        }
      },
      {
        enableHighAccuracy: true,
        timeout: maxWaitMs,
        maximumAge: 0  // Always get fresh position
      }
    )
  })
}

/**
 * Quick position (single reading)
 */
export async function getQuickPosition(): Promise<GPSPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: 0, message: 'Geolocation not supported' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
          timestamp: position.timestamp
        })
      },
      (error) => {
        reject({
          code: error.code,
          message: getErrorMessage(error.code)
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  })
}

/**
 * Watch position continuously
 */
export function watchPosition(
  onPosition: (pos: GPSPosition) => void,
  onError?: (err: GPSError) => void
): () => void {
  if (!navigator.geolocation) {
    onError?.({ code: 0, message: 'Geolocation not supported' })
    return () => {}
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude ?? undefined,
        altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
        timestamp: position.timestamp
      })
    },
    (error) => {
      onError?.({
        code: error.code,
        message: getErrorMessage(error.code)
      })
    },
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 1000
    }
  )

  return () => navigator.geolocation.clearWatch(watchId)
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function getDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Get accuracy rating
 */
export function getAccuracyRating(accuracy: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
  if (accuracy <= EXCELLENT_ACCURACY) return 'excellent'
  if (accuracy <= GOOD_ACCURACY) return 'good'
  if (accuracy <= ACCEPTABLE_ACCURACY) return 'acceptable'
  return 'poor'
}

/**
 * Should we require manual confirmation?
 */
export function requiresConfirmation(accuracy: number): boolean {
  return accuracy > ACCEPTABLE_ACCURACY
}

/**
 * Format accuracy for display
 */
export function formatAccuracy(accuracy: number): string {
  if (accuracy < 1) return '< 1m'
  if (accuracy < 10) return `${accuracy.toFixed(1)}m`
  return `${Math.round(accuracy)}m`
}

/**
 * Get human-readable error message
 */
function getErrorMessage(code: number): string {
  switch (code) {
    case 1: return 'Location permission denied. Please enable GPS.'
    case 2: return 'Location unavailable. Try moving to an open area.'
    case 3: return 'Location request timed out. Please try again.'
    default: return 'Unknown location error'
  }
}

/**
 * Reverse geocode coordinates to address (using free Nominatim API)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'EMG-FieldOps/1.0'
        }
      }
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.address) {
      const { house_number, road, city, town, village, state } = data.address
      const parts = []
      if (house_number && road) parts.push(`${house_number} ${road}`)
      else if (road) parts.push(road)
      if (city || town || village) parts.push(city || town || village)
      if (state) parts.push(state)
      return parts.join(', ') || data.display_name
    }
    
    return data.display_name || null
  } catch (e) {
    console.error('Reverse geocode error:', e)
    return null
  }
}
