/**
 * Rejected Deals from Arcadia
 * Deals that were submitted but didn't go through
 * Synced from Viper Arcadia Report: 2026-01-27
 */

export interface RejectedDeal {
  customerName: string
  address: string
  city: string
  state: string
  zip: string
  saleDate: string
  orderStatus: string
  orderStatusReason?: string
  repName: string
  lat?: number
  lng?: number
}

// From Viper Arcadia Report - Cannot Process / Failed / Denied
export const REJECTED_DEALS: RejectedDeal[] = [
  { customerName: 'Sample Bill', address: '5748 Castle Bridge Rd', city: 'Fredericksburg', state: 'VA', zip: '22407', saleDate: '2026-01-21', orderStatus: 'Cannot Process', orderStatusReason: 'TPV Not Complete', repName: 'Alexander Stewart', lat: 38.2925, lng: -77.5195 },
  { customerName: 'Valerie M Goosby', address: '243 Faison St', city: 'Emporia', state: 'VA', zip: '23847', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Not Entered in Customer Portal', repName: 'Jared DeLong', lat: 36.6872, lng: -77.5414 },
  { customerName: 'Tralve Bass Jr', address: '105 Tyler Blvd', city: 'Crewe', state: 'VA', zip: '23930', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Terms not Checked', repName: 'Zaytije Mercer', lat: 37.1795, lng: -78.1294 },
  { customerName: 'Doshannae L Wilkins', address: '133 Carroll St', city: 'Emporia', state: 'VA', zip: '23847', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Not Entered in Customer Portal', repName: 'Isabella Cutrie', lat: 36.6891, lng: -77.5389 },
  { customerName: 'Delores Pittman', address: '2013 Timber Ln', city: 'Chesapeake', state: 'VA', zip: '23324', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Terms not Checked', repName: 'Lejohn Windn', lat: 36.7892, lng: -76.2815 },
  { customerName: 'Tamara Davis', address: '2009 Timber Ln', city: 'Chesapeake', state: 'VA', zip: '23324', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Not Entered in Customer Portal', repName: 'Markell Hill', lat: 36.7891, lng: -76.2817 },
  { customerName: 'Scott Wilkinson', address: '504 Park Ave', city: 'Emporia', state: 'VA', zip: '23847', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Terms not Checked', repName: 'Tyler Dessaure', lat: 36.6958, lng: -77.5325 },
  { customerName: 'Frederick M Garrett', address: '221 Meherrin Ln', city: 'Emporia', state: 'VA', zip: '23847', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Terms not Checked', repName: 'Isabella Cutrie', lat: 36.6845, lng: -77.5398 },
  { customerName: 'Travis Wilkins', address: '218 Park Ave', city: 'Emporia', state: 'VA', zip: '23847', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Terms not Checked', repName: 'Tyler Dessaure', lat: 36.6942, lng: -77.5321 },
  { customerName: 'April Hayes', address: '1107 W Tennessee Ave', city: 'Crewe', state: 'VA', zip: '23930', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Missing Utility Info', repName: 'Zaytije Mercer', lat: 37.1812, lng: -78.1345 },
  { customerName: 'Latrell Davis', address: '2104 Farmer Ln', city: 'Chesapeake', state: 'VA', zip: '23324', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Terms not Checked', repName: 'Michael Scotford', lat: 36.7845, lng: -76.2756 },
  { customerName: 'Dion Whitaker', address: '2511 Malcolm Ct', city: 'Chesapeake', state: 'VA', zip: '23324', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Missing Utility Info', repName: 'Michael Scotford', lat: 36.7798, lng: -76.2834 },
  { customerName: 'Nancy F Gaines', address: '408 Park Ave', city: 'Emporia', state: 'VA', zip: '23847', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Terms not Checked', repName: 'Tyler Dessaure', lat: 36.6951, lng: -77.5328 },
  { customerName: 'Dwayne Clayton Moore', address: '300 S Turner St', city: 'Emporia', state: 'VA', zip: '23847', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Not Entered in Customer Portal', repName: 'Jared DeLong', lat: 36.6867, lng: -77.5356 },
  { customerName: 'Alvin Epps', address: '306 Tyler Dr', city: 'Crewe', state: 'VA', zip: '23930', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Terms not Checked', repName: 'Omar Amin', lat: 37.1785, lng: -78.1267 },
  { customerName: 'Agnes M Jones', address: '505 Broad St', city: 'Emporia', state: 'VA', zip: '23847', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Terms not Checked', repName: 'Tyler Dessaure', lat: 36.6923, lng: -77.5412 },
  { customerName: 'Alverta Cuffee', address: '2015 Timber Ln', city: 'Chesapeake', state: 'VA', zip: '23324', saleDate: '2026-01-20', orderStatus: 'Cannot Process', orderStatusReason: 'Terms not Checked', repName: 'Michael Scotford', lat: 36.7893, lng: -76.2814 },
  { customerName: 'Jessica Black', address: '11544 Pasture Ln', city: 'Fredericksburg', state: 'VA', zip: '22407', saleDate: '2026-01-18', orderStatus: 'Denied', orderStatusReason: 'Customer Cancelled', repName: 'Jamar Johnson', lat: 38.2891, lng: -77.5234 },
  { customerName: 'Gary Scott', address: '782 Cumberland St', city: 'Port Royal', state: 'VA', zip: '22535', saleDate: '2026-01-18', orderStatus: 'Cannot Process', orderStatusReason: 'Account Not Found', repName: 'Zaytije Mercer', lat: 38.1678, lng: -77.1923 },
  { customerName: 'Bobby Stoneberger', address: '6432 Hayloft Ln', city: 'Fredericksburg', state: 'VA', zip: '22407', saleDate: '2026-01-18', orderStatus: 'Cannot Process', orderStatusReason: 'Not Entered in Customer Portal', repName: 'Syed Nouman', lat: 38.2867, lng: -77.5312 },
  { customerName: 'Viola Tyler', address: '504 King St', city: 'Port Royal', state: 'VA', zip: '22535', saleDate: '2026-01-18', orderStatus: 'Cannot Process', orderStatusReason: 'Account Not Found', repName: 'Zaytije Mercer', lat: 38.1684, lng: -77.1912 },
  { customerName: 'Richard W Fitzgerald', address: '337 N Delphine Ave', city: 'Waynesboro', state: 'VA', zip: '22980', saleDate: '2026-01-17', orderStatus: 'Cannot Process', orderStatusReason: 'Account Not Found', repName: 'Syed Nouman', lat: 38.0712, lng: -78.8945 },
  { customerName: 'Fred D Fulkerson', address: '1636 Townwood Ct', city: 'Charlottesville', state: 'VA', zip: '22901', saleDate: '2026-01-17', orderStatus: 'Cannot Process', orderStatusReason: 'Account Not Found', repName: 'Isabella Cutrie', lat: 38.0534, lng: -78.5123 },
  { customerName: 'Cory Cash', address: '262 N Charlotte Ave', city: 'Waynesboro', state: 'VA', zip: '22980', saleDate: '2026-01-17', orderStatus: 'Cannot Process', orderStatusReason: 'Missing Utility Info', repName: 'Zaytije Mercer', lat: 38.0698, lng: -78.8912 },
  { customerName: 'Liza Calderon', address: '4063 Cypress Pointe Dr', city: 'Charlottesville', state: 'VA', zip: '22901', saleDate: '2026-01-17', orderStatus: 'Cannot Process', orderStatusReason: 'Account Not Found', repName: 'Jared DeLong', lat: 38.0612, lng: -78.5234 },
  { customerName: 'Adam B Mcneil', address: '508 Druid Ave', city: 'Charlottesville', state: 'VA', zip: '22902', saleDate: '2026-01-17', orderStatus: 'Failed', orderStatusReason: 'Account Not Found', repName: 'Tyler Dessaure', lat: 38.0278, lng: -78.4856 },
  { customerName: 'Danielle Devere', address: '4055 Cypress Pointe Dr', city: 'Charlottesville', state: 'VA', zip: '22901', saleDate: '2026-01-17', orderStatus: 'Cannot Process', orderStatusReason: 'Account Not Found', repName: 'Jared DeLong', lat: 38.0615, lng: -78.5231 },
]

// Get rejected deals with coordinates (for map display)
export function getRejectedDealsWithCoords(): RejectedDeal[] {
  return REJECTED_DEALS.filter(d => d.lat && d.lng)
}

// Get all rejected deals
export function getRejectedDeals(): RejectedDeal[] {
  return REJECTED_DEALS
}
