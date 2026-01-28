/**
 * Zone centroids for map overlay
 * Approximate center points for each zip code zone
 */

export interface ZoneCentroid {
  zip: string
  lat: number
  lng: number
}

// Virginia zip code approximate centroids
export const ZONE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  // Hampton Roads
  '23669': { lat: 37.0488, lng: -76.3655 }, // Hampton
  '23324': { lat: 36.7862, lng: -76.2751 }, // Chesapeake
  '23320': { lat: 36.7682, lng: -76.2365 }, // Chesapeake
  '23454': { lat: 36.8384, lng: -75.9963 }, // Virginia Beach
  '23602': { lat: 37.1021, lng: -76.5006 }, // Newport News
  '23702': { lat: 36.8205, lng: -76.3683 }, // Portsmouth
  '23606': { lat: 37.0718, lng: -76.4916 }, // Newport News
  '23703': { lat: 36.8768, lng: -76.3751 }, // Portsmouth
  '23321': { lat: 36.8062, lng: -76.3951 }, // Chesapeake
  '23518': { lat: 36.9085, lng: -76.2125 }, // Norfolk
  '23451': { lat: 36.8530, lng: -76.0018 }, // Virginia Beach
  '23502': { lat: 36.8676, lng: -76.1971 }, // Norfolk
  '23505': { lat: 36.9176, lng: -76.2871 }, // Norfolk
  '23513': { lat: 36.8858, lng: -76.2427 }, // Norfolk
  '23601': { lat: 37.0221, lng: -76.4366 }, // Newport News
  '23503': { lat: 36.9458, lng: -76.2671 }, // Norfolk
  '23325': { lat: 36.8062, lng: -76.2351 }, // Chesapeake
  '23663': { lat: 37.0238, lng: -76.3355 }, // Hampton
  '23464': { lat: 36.7984, lng: -76.1763 }, // Virginia Beach
  '23701': { lat: 36.8365, lng: -76.3483 }, // Portsmouth
  '23453': { lat: 36.7884, lng: -76.0763 }, // Virginia Beach
  '23666': { lat: 37.0638, lng: -76.4055 }, // Hampton
  '23508': { lat: 36.8876, lng: -76.3071 }, // Norfolk
  '23523': { lat: 36.8358, lng: -76.2627 }, // Norfolk
  '23605': { lat: 37.0121, lng: -76.4566 }, // Newport News
  '23664': { lat: 37.0538, lng: -76.3055 }, // Hampton
  '23435': { lat: 36.8962, lng: -76.4851 }, // Suffolk
  
  // Richmond Area
  '23075': { lat: 37.5538, lng: -77.3155 }, // Henrico
  '23228': { lat: 37.6138, lng: -77.4955 }, // Henrico
  '23060': { lat: 37.6538, lng: -77.5555 }, // Glen Allen
  '23225': { lat: 37.5138, lng: -77.4855 }, // Richmond
  '23111': { lat: 37.6238, lng: -77.3155 }, // Mechanicsville
  
  // Other Virginia
  '23901': { lat: 37.3021, lng: -78.3918 }, // Farmville
  '23970': { lat: 36.7262, lng: -78.1251 }, // South Hill
  '23868': { lat: 36.7562, lng: -77.8451 }, // Lawrenceville
  '23837': { lat: 36.7162, lng: -77.0651 }, // Courtland
  '23430': { lat: 36.9862, lng: -76.6251 }, // Smithfield
  '22902': { lat: 38.0262, lng: -78.4851 }, // Charlottesville
  '22901': { lat: 38.0562, lng: -78.5151 }, // Charlottesville
  '23188': { lat: 37.3162, lng: -76.7451 }, // Williamsburg
  '23185': { lat: 37.2762, lng: -76.7051 }, // Williamsburg
  '23690': { lat: 37.2262, lng: -76.5051 }, // Yorktown
}

export function getZoneCentroid(zip: string): { lat: number; lng: number } | null {
  return ZONE_CENTROIDS[zip] || null
}
