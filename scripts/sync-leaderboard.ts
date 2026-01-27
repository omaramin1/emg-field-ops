/**
 * Viper Leaderboard Sync Script
 * Pulls payroll data from Viper and updates the leaderboard
 * Run every Monday: npx ts-node scripts/sync-leaderboard.ts
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface RepStats {
  name: string;
  deals: number;
  kwh: number;
}

// Viper credentials - set via environment variables
const VIPER_URL = 'https://portal.viprweb.com';
const VIPER_USER = process.env.VIPER_USER || '';
const VIPER_PASS = process.env.VIPER_PASS || '';

async function getPayrollDateRange(): Promise<{ start: string; end: string }> {
  // Payroll week: Mon-Sun, 13 days back from today
  const today = new Date();
  const daysBack = 13;
  
  // Find the Monday of payroll week
  const payrollEnd = new Date(today);
  payrollEnd.setDate(today.getDate() - daysBack);
  
  // Adjust to get the Sunday of that week
  const dayOfWeek = payrollEnd.getDay();
  const sundayOffset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  payrollEnd.setDate(payrollEnd.getDate() + sundayOffset);
  
  // Monday is 6 days before Sunday
  const payrollStart = new Date(payrollEnd);
  payrollStart.setDate(payrollEnd.getDate() - 6);
  
  const format = (d: Date) => d.toISOString().split('T')[0];
  
  return {
    start: format(payrollStart),
    end: format(payrollEnd)
  };
}

async function syncLeaderboard() {
  console.log('🔄 Starting Viper leaderboard sync...');
  
  const dateRange = await getPayrollDateRange();
  console.log(`📅 Payroll period: ${dateRange.start} to ${dateRange.end}`);
  
  if (!VIPER_USER || !VIPER_PASS) {
    console.error('❌ Missing VIPER_USER or VIPER_PASS environment variables');
    process.exit(1);
  }
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Login to Viper
    console.log('🔑 Logging into Viper...');
    await page.goto(VIPER_URL, { waitUntil: 'networkidle2' });
    
    // TODO: Add login flow once we have credentials format
    // await page.type('#username', VIPER_USER);
    // await page.type('#password', VIPER_PASS);
    // await page.click('#login-button');
    
    // Navigate to Sales Dashboard
    console.log('📊 Navigating to Sales Dashboard...');
    await page.goto(`${VIPER_URL}/#Page:Dashboard`, { waitUntil: 'networkidle2' });
    
    // Wait for data to load
    await page.waitForSelector('table', { timeout: 30000 });
    
    // TODO: Filter by date range and extract rep stats
    // This will need to be customized based on Viper's exact UI
    
    console.log('✅ Sync complete!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await browser.close();
  }
}

// Run if called directly
syncLeaderboard();
