/**
 * Do Not Knock List
 * Synced from Viper - addresses reps should NOT knock
 * Last sync: 2026-01-27
 */

export interface DNKAddress {
  name?: string
  address: string
  city: string
  state: string
  zip: string
  lat?: number
  lng?: number
}

// From Viper Do Not Knock Report
export const DO_NOT_KNOCK_LIST: DNKAddress[] = [
  { name: 'Wendy Michael', address: '14501 United Dr', city: 'Chantilly', state: 'VA', zip: '20151', lat: 38.8961985, lng: -77.4505165 },
  { name: 'Edward Gootman', address: '8653 Vast Rose Drive', city: 'Columbia', state: 'MD', zip: '21045', lat: 39.1925764, lng: -76.8084462 },
  { name: 'Park Plaza Cooperative', address: '1260 Onondaga St NE', city: 'Fridley', state: 'MN', zip: '55432' },
  { address: '902 10th av N', city: 'Minneapolis', state: 'MN', zip: '', lat: 44.9899415, lng: -93.2810918 },
  { name: 'Aurora Fields', address: '168 big low lane unit b', city: 'St Paul', state: 'MN', zip: '55117' },
  { name: 'Christine Brown', address: '439 Robinson Dr', city: 'Wilmington', state: 'DE', zip: '19801', lat: 39.6976536, lng: -75.5841802 },
  { name: 'Michael Suozzo', address: '450 Coolidge Ave', city: 'Manchester Township', state: 'NJ', zip: '08759', lat: 39.941677, lng: -74.365389 },
  { address: '15 Willow Bend Ct', city: 'Portsmouth', state: 'VA', zip: '23703', lat: 36.867497, lng: -76.406077 },
  { address: '200 Varsity Ln', city: 'Bear', state: 'DE', zip: '19701' },
  { name: 'Miss Cristina', address: 'Crestwood Village 5 325 Schoolhouse Road', city: 'Whiting', state: 'NJ', zip: '08759' },
  { name: 'Christina Nolan', address: '325 Schoolhouse Road', city: 'Whiting', state: 'NJ', zip: '08759' },
  { name: 'Lorraine', address: '200 Varsity Ln', city: 'Bear', state: 'DE', zip: '19701' },
  { name: 'Christopher Marshall', address: '13 N Water St', city: 'Athens', state: 'NY', zip: '12015', lat: 42.2612543, lng: -73.8066376 },
  { name: 'Michelle Denise', address: 'Cornell St, 100', city: 'Aberdeen', state: 'MD', zip: '21001', lat: 39.5071622, lng: -76.181141 },
  { name: 'Pinegates Apartment Complex', address: '35 Osage Dr', city: 'Old Bridge', state: 'NJ', zip: '08857' },
  { name: 'Melissa Morales', address: '150 Hyde Park Rd', city: 'Somerset', state: 'NJ', zip: '08873', lat: 40.521778, lng: -74.517524 },
  { name: 'Village Solar Apartment Complex', address: 'Village Circle', city: 'Ithaca', state: 'NY', zip: '14850' },
  { name: 'Village Solar Apartment Complex', address: '1067 Warren Rd', city: 'Ithaca', state: 'NY', zip: '14850', lat: 42.51027045, lng: -76.47129316 },
  { name: 'Village Solar Apartment Complex', address: '40 Village Pl', city: 'Ithaca', state: 'NY', zip: '14850' },
  { name: 'Levi Reeves', address: '219 Ranalet Dr', city: 'Hampton', state: 'VA', zip: '23664', lat: 37.056212, lng: -76.3027648 },
  { name: 'Lori Hertl', address: '20 Boxhill S Parkway', city: 'Abington', state: 'MD', zip: '21009' },
]

// Check if an address is on the DNK list
export function isDoNotKnock(address: string, city?: string): boolean {
  const normalized = address.toLowerCase().trim()
  return DO_NOT_KNOCK_LIST.some(dnk => 
    dnk.address.toLowerCase().includes(normalized) ||
    normalized.includes(dnk.address.toLowerCase())
  )
}

// Get DNK entries with coordinates (for map display)
export function getDNKWithCoords(): DNKAddress[] {
  return DO_NOT_KNOCK_LIST.filter(dnk => dnk.lat && dnk.lng)
}
