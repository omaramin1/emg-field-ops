/**
 * Competitor Deals from Viper Scrape
 * Gray pins on map - shows market activity
 * Source: VA_Sales_Data.csv (34,768 records)
 * Last sync: 2026-01-28
 */

export interface CompetitorDeal {
  id: number
  refNum: string
  saleDate?: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
}

// Loaded dynamically from JSON to keep bundle size manageable
// This file exports the loader function

export async function loadCompetitorDeals(): Promise<CompetitorDeal[]> {
  try {
    const response = await fetch('/data/competitor-deals.json')
    if (!response.ok) return []
    return await response.json()
  } catch (e) {
    console.error('Failed to load competitor deals:', e)
    return []
  }
}

// For initial testing - sample subset
export const COMPETITOR_DEALS_SAMPLE: CompetitorDeal[] = []
