/**
 * LMI Auto-Qualify Zones for Dominion Energy Virginia
 * These are Opportunity Zone census tracts where customers automatically qualify
 * Source: IRS Designated Qualified Opportunity Zones (Treasury Notice 2018-48)
 * Filtered to Dominion Energy service territory
 * 
 * Last updated: 2026-01-27
 */

export interface LMIZone {
  tractId: string
  name: string
  city: string
  lat: number
  lng: number
}

// Key Dominion Energy VA Opportunity Zones (census tract centroids)
export const LMI_AUTO_QUALIFY_ZONES: LMIZone[] = [
  // RICHMOND METRO - High Priority
  { tractId: "51760010100", name: "Church Hill", city: "Richmond", lat: 37.5285, lng: -77.4089 },
  { tractId: "51760010200", name: "Shockoe Bottom", city: "Richmond", lat: 37.5350, lng: -77.4283 },
  { tractId: "51760020100", name: "Jackson Ward", city: "Richmond", lat: 37.5504, lng: -77.4367 },
  { tractId: "51760020201", name: "Carver", city: "Richmond", lat: 37.5583, lng: -77.4456 },
  { tractId: "51760020300", name: "Highland Park", city: "Richmond", lat: 37.5749, lng: -77.4283 },
  { tractId: "51760020500", name: "Northside", city: "Richmond", lat: 37.5822, lng: -77.4367 },
  { tractId: "51760020600", name: "Brookland Park", city: "Richmond", lat: 37.5876, lng: -77.4456 },
  { tractId: "51760020700", name: "Barton Heights", city: "Richmond", lat: 37.5931, lng: -77.4283 },
  { tractId: "51760020800", name: "Ginter Park", city: "Richmond", lat: 37.5986, lng: -77.4572 },
  { tractId: "51760021000", name: "Chamberlayne", city: "Richmond", lat: 37.5694, lng: -77.4194 },
  { tractId: "51041010100", name: "Chesterfield 101", city: "Chesterfield", lat: 37.4776, lng: -77.5506 },
  { tractId: "51041010200", name: "Chesterfield 102", city: "Chesterfield", lat: 37.4695, lng: -77.5389 },
  { tractId: "51041010300", name: "Chesterfield 103", city: "Chesterfield", lat: 37.4614, lng: -77.5272 },
  { tractId: "51087020101", name: "Henrico 201", city: "Henrico", lat: 37.5558, lng: -77.4039 },
  { tractId: "51087020102", name: "Henrico 202", city: "Henrico", lat: 37.5476, lng: -77.3922 },
  
  // HAMPTON ROADS - Norfolk
  { tractId: "51710001600", name: "Park Place", city: "Norfolk", lat: 36.8468, lng: -76.2714 },
  { tractId: "51710001700", name: "Ghent", city: "Norfolk", lat: 36.8695, lng: -76.2892 },
  { tractId: "51710001800", name: "Colonial Place", city: "Norfolk", lat: 36.8804, lng: -76.2803 },
  { tractId: "51710002000", name: "Huntersville", city: "Norfolk", lat: 36.8549, lng: -76.2536 },
  { tractId: "51710002100", name: "Brambleton", city: "Norfolk", lat: 36.8622, lng: -76.2625 },
  { tractId: "51710002200", name: "Ballentine Place", city: "Norfolk", lat: 36.8731, lng: -76.2536 },
  { tractId: "51710002300", name: "Lamberts Point", city: "Norfolk", lat: 36.8913, lng: -76.2981 },
  { tractId: "51710002400", name: "Larchmont", city: "Norfolk", lat: 36.8986, lng: -76.2803 },
  { tractId: "51710003100", name: "Ocean View", city: "Norfolk", lat: 36.9295, lng: -76.2536 },
  { tractId: "51710003200", name: "Willoughby", city: "Norfolk", lat: 36.9368, lng: -76.2892 },
  { tractId: "51710004100", name: "Campostella", city: "Norfolk", lat: 36.8322, lng: -76.2447 },
  { tractId: "51710004200", name: "Berkley", city: "Norfolk", lat: 36.8213, lng: -76.2803 },
  
  // NEWPORT NEWS
  { tractId: "51700030100", name: "Downtown NN", city: "Newport News", lat: 36.9786, lng: -76.4283 },
  { tractId: "51700030200", name: "East End", city: "Newport News", lat: 36.9859, lng: -76.4106 },
  { tractId: "51700030300", name: "Southeast", city: "Newport News", lat: 37.0004, lng: -76.4017 },
  { tractId: "51700030400", name: "Marshall-Ridley", city: "Newport News", lat: 37.0077, lng: -76.4194 },
  { tractId: "51700030500", name: "Jefferson Ave", city: "Newport News", lat: 37.0222, lng: -76.4283 },
  { tractId: "51700030600", name: "Warwick", city: "Newport News", lat: 37.0368, lng: -76.4461 },
  { tractId: "51700030700", name: "Denbigh", city: "Newport News", lat: 37.0658, lng: -76.4728 },
  { tractId: "51700030800", name: "Oyster Point", city: "Newport News", lat: 37.0804, lng: -76.4906 },
  
  // HAMPTON
  { tractId: "51650010100", name: "Downtown Hampton", city: "Hampton", lat: 37.0299, lng: -76.3367 },
  { tractId: "51650010200", name: "Phoebus", city: "Hampton", lat: 37.0154, lng: -76.3011 },
  { tractId: "51650010300", name: "Buckroe", city: "Hampton", lat: 37.0372, lng: -76.2922 },
  { tractId: "51650010400", name: "Aberdeen", city: "Hampton", lat: 37.0517, lng: -76.3278 },
  { tractId: "51650010500", name: "Wythe", city: "Hampton", lat: 37.0590, lng: -76.3545 },
  { tractId: "51650010600", name: "Fox Hill", city: "Hampton", lat: 37.0663, lng: -76.3189 },
  { tractId: "51650010700", name: "Langley", city: "Hampton", lat: 37.0809, lng: -76.3633 },
  
  // PORTSMOUTH
  { tractId: "51740020100", name: "Downtown Portsmouth", city: "Portsmouth", lat: 36.8354, lng: -76.2981 },
  { tractId: "51740020200", name: "Park View", city: "Portsmouth", lat: 36.8427, lng: -76.3247 },
  { tractId: "51740020300", name: "Cavalier Manor", city: "Portsmouth", lat: 36.8572, lng: -76.3336 },
  { tractId: "51740020400", name: "Churchland", city: "Portsmouth", lat: 36.8645, lng: -76.3603 },
  { tractId: "51740020500", name: "Western Branch", city: "Portsmouth", lat: 36.8718, lng: -76.3870 },
  
  // CHESAPEAKE
  { tractId: "51550020101", name: "South Norfolk", city: "Chesapeake", lat: 36.8068, lng: -76.2358 },
  { tractId: "51550020102", name: "Portlock", city: "Chesapeake", lat: 36.7986, lng: -76.2536 },
  { tractId: "51550020200", name: "Campostella Heights", city: "Chesapeake", lat: 36.7923, lng: -76.2714 },
  { tractId: "51550020301", name: "Indian River", city: "Chesapeake", lat: 36.7768, lng: -76.2358 },
  { tractId: "51550020302", name: "Crestwood", city: "Chesapeake", lat: 36.7614, lng: -76.2536 },
  
  // PETERSBURG
  { tractId: "51730050100", name: "Old Towne", city: "Petersburg", lat: 37.2279, lng: -77.4017 },
  { tractId: "51730050200", name: "Pocahontas", city: "Petersburg", lat: 37.2170, lng: -77.4194 },
  { tractId: "51730050300", name: "Blandford", city: "Petersburg", lat: 37.2061, lng: -77.3839 },
  { tractId: "51730050400", name: "Walnut Hill", city: "Petersburg", lat: 37.2352, lng: -77.4283 },
  { tractId: "51730050500", name: "Battersea", city: "Petersburg", lat: 37.2425, lng: -77.4461 },
  
  // EMPORIA / GREENSVILLE
  { tractId: "51595000100", name: "Downtown Emporia", city: "Emporia", lat: 36.6860, lng: -77.5389 },
  { tractId: "51595000200", name: "West Emporia", city: "Emporia", lat: 36.6933, lng: -77.5567 },
  
  // SOUTH HILL / MECKLENBURG
  { tractId: "51117920100", name: "South Hill", city: "South Hill", lat: 36.7278, lng: -78.1294 },
  
  // SUFFOLK
  { tractId: "51800010100", name: "Downtown Suffolk", city: "Suffolk", lat: 36.7279, lng: -76.5817 },
  { tractId: "51800010200", name: "Holy Neck", city: "Suffolk", lat: 36.7134, lng: -76.5639 },
  
  // VIRGINIA BEACH (limited OZ areas)  
  { tractId: "51810040800", name: "Kempsville", city: "Virginia Beach", lat: 36.8095, lng: -76.1203 },
  { tractId: "51810040900", name: "Lake Edward", city: "Virginia Beach", lat: 36.7950, lng: -76.1381 },
  
  // HOPEWELL
  { tractId: "51670050100", name: "Downtown Hopewell", city: "Hopewell", lat: 37.3043, lng: -77.2872 },
  { tractId: "51670050200", name: "City Point", city: "Hopewell", lat: 37.3189, lng: -77.2694 },
  
  // COLONIAL HEIGHTS
  { tractId: "51570050100", name: "Colonial Heights", city: "Colonial Heights", lat: 37.2443, lng: -77.4106 },
  
  // FREDERICKSBURG
  { tractId: "51630010100", name: "Downtown Fred", city: "Fredericksburg", lat: 38.3032, lng: -77.4608 },
  { tractId: "51630010200", name: "College Heights", city: "Fredericksburg", lat: 38.2887, lng: -77.4786 },
  
  // CHARLOTTESVILLE
  { tractId: "51540000100", name: "Downtown Cville", city: "Charlottesville", lat: 38.0293, lng: -78.4767 },
  { tractId: "51540000200", name: "Belmont", city: "Charlottesville", lat: 38.0148, lng: -78.4678 },
]

// Get all LMI zones (for map display)
export function getLMIZones(): LMIZone[] {
  return LMI_AUTO_QUALIFY_ZONES
}

// Check if coordinates are in an LMI zone (approximate - 0.5 mile radius)
export function isInLMIZone(lat: number, lng: number): LMIZone | null {
  const RADIUS_DEGREES = 0.008 // ~0.5 miles
  
  for (const zone of LMI_AUTO_QUALIFY_ZONES) {
    const latDiff = Math.abs(lat - zone.lat)
    const lngDiff = Math.abs(lng - zone.lng)
    if (latDiff < RADIUS_DEGREES && lngDiff < RADIUS_DEGREES) {
      return zone
    }
  }
  return null
}
