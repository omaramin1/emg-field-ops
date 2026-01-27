# EMG Field Rep App

The only app a rep needs in the field.

## Quick Start

```bash
cd app
npm install
npm run dev
```

## What It Does

**For Reps:**
- See today's earnings (front and center)
- GPS-guided walking routes
- One-tap door logging
- Camera bill scanning for signups
- Real-time leaderboard
- Pitch scripts in your pocket
- Works offline

**For Managers:**
- Live map of all reps
- Real-time signup tracking
- Territory assignment
- Performance dashboards

## Stack

- **Frontend:** React + TypeScript
- **Mobile:** PWA (works on any phone, installable)
- **Backend:** Supabase (auth, database, real-time)
- **Maps:** Mapbox GL
- **Offline:** Service Worker + IndexedDB

## Structure

```
app/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Screen views
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API + offline sync
│   ├── stores/         # State management
│   └── utils/          # Helpers
├── public/
│   └── manifest.json   # PWA config
└── package.json
```

## Screens

1. **Today** — Earnings, territory, daily progress
2. **Map** — Territory with door pins, GPS tracking
3. **Door** — Log outcome, capture signup
4. **Leaderboard** — Rankings, competition
5. **Earnings** — Detailed breakdown, payouts
6. **Reference** — Scripts, objection handlers

## Development

See `PRODUCT_SPEC.md` for full requirements.
