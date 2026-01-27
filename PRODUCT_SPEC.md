# EMG Field Rep App
## Product Specification

---

## Vision

The only app a rep needs in the field. Everything they need to do their job, nothing they don't. Fast, offline-capable, and makes them money.

---

## Core Principles

1. **One-thumb operation** — Usable while standing at a door
2. **Offline-first** — Works in dead zones, syncs when connected
3. **Show the money** — Reps see earnings in real-time
4. **Zero friction** — Minimum taps to complete any action
5. **GPS-aware** — Knows where you are, guides where to go

---

## User Personas

### The Rep
- In the field 6-8 hours/day
- Needs to track doors, capture signups, see earnings
- Wants to know they're winning (vs peers, vs goals)
- Phone is their only tool

### The Manager
- Monitors team performance
- Assigns territories
- Needs real-time visibility
- Handles escalations

---

## Feature Set

### 1. TODAY VIEW (Home Screen)

```
┌─────────────────────────────────┐
│  Good morning, Marcus           │
│  ───────────────────────────    │
│  TODAY'S EARNINGS               │
│  ┌─────────────────────────┐    │
│  │      $127.50            │    │
│  │   ▲ 3 signups today     │    │
│  └─────────────────────────┘    │
│                                 │
│  YOUR TERRITORY                 │
│  Langley Mobile Home Village    │
│  [🗺️ Open Map]  [▶️ Start]      │
│                                 │
│  DAILY PROGRESS                 │
│  Doors: ████████░░ 67/100       │
│  Signups: ███░░░░░░ 3/10        │
│                                 │
│  [📊 Leaderboard]               │
└─────────────────────────────────┘
```

**What it does:**
- Shows earnings front and center (motivation)
- One tap to start working territory
- Progress bars toward daily goals
- Quick access to leaderboard

---

### 2. TERRITORY MAP

```
┌─────────────────────────────────┐
│  ← Langley Village    ⚙️        │
│  ───────────────────────────    │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │    [MAP VIEW]           │    │
│  │    🟢 = Not knocked     │    │
│  │    🟡 = Callback        │    │
│  │    🔵 = Signed          │    │
│  │    ⚫ = Not home/No     │    │
│  │    📍 = You are here    │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Next: 142 Collier Dr           │
│  [📍 Navigate]  [⏭️ Skip]        │
│                                 │
│  Knocked: 34  |  Remaining: 46  │
└─────────────────────────────────┘
```

**What it does:**
- Visual map of territory with door statuses
- GPS tracks your location
- Suggests optimal next door
- One-tap navigation
- Color-coded pins show progress

---

### 3. DOOR INTERACTION (The Core Flow)

```
┌─────────────────────────────────┐
│  142 Collier Dr                 │
│  ───────────────────────────    │
│                                 │
│  ┌───────┐ ┌───────┐ ┌───────┐  │
│  │  😶   │ │  ❌   │ │  ✅   │  │
│  │  No   │ │  No   │ │ Yes!  │  │
│  │Answer │ │       │ │Qualify│  │
│  └───────┘ └───────┘ └───────┘  │
│                                 │
│  ┌───────┐ ┌───────┐            │
│  │  🔄   │ │  🚫   │            │
│  │Callback│ │ Skip │            │
│  └───────┘ └───────┘            │
│                                 │
│  [💡 Pitch Script]              │
│  [🛡️ Objection Help]            │
└─────────────────────────────────┘
```

**What it does:**
- Large tap targets for quick logging
- One tap = door logged, moves to next
- "Yes! Qualify" opens signup flow
- Quick access to scripts if needed

---

### 4. SIGNUP FLOW

```
┌─────────────────────────────────┐
│  New Signup                     │
│  ───────────────────────────    │
│                                 │
│  CUSTOMER INFO                  │
│  ┌─────────────────────────┐    │
│  │ Name: [              ]  │    │
│  │ Phone: [             ]  │    │
│  │ Address: [Auto-filled]  │    │
│  └─────────────────────────┘    │
│                                 │
│  QUALIFYING BENEFIT             │
│  ○ SNAP    ○ Medicaid   ○ SSI   │
│  ○ LIHEAP  ○ TANF       ○ WIC   │
│  ○ VA      ○ Other             │
│                                 │
│  ELECTRIC ACCOUNT               │
│  [📷 Scan Bill]                 │
│  Account #: [Auto-captured]     │
│                                 │
│  [✅ Submit Signup]             │
└─────────────────────────────────┘
```

**What it does:**
- Auto-fills address from GPS
- Camera scans electric bill (OCR)
- Minimal typing required
- Benefit selection is tap-only
- Submit = instant commission credit

---

### 5. LEADERBOARD

```
┌─────────────────────────────────┐
│  🏆 Leaderboard                 │
│  ───────────────────────────    │
│  TODAY         WEEK       ALL   │
│  ════                           │
│  ┌─────────────────────────┐    │
│  │ 1. 🥇 DeShawn    $342   │    │
│  │ 2. 🥈 Maria      $285   │    │
│  │ 3. 🥉 Jaylen     $213   │    │
│  │ 4.    Marcus     $127 ← │    │
│  │ 5.    Keisha     $114   │    │
│  │ 6.    Devon      $85    │    │
│  └─────────────────────────┘    │
│                                 │
│  Your rank: #4 of 12            │
│  $86 behind Maria               │
│  2 signups to reach #3          │
└─────────────────────────────────┘
```

**What it does:**
- Real-time rankings
- Daily/Weekly/All-time views
- Shows exact gap to next rank
- Gamified competition

---

### 6. EARNINGS TRACKER

```
┌─────────────────────────────────┐
│  💰 Earnings                    │
│  ───────────────────────────    │
│                                 │
│  THIS WEEK                      │
│  ┌─────────────────────────┐    │
│  │       $847.50           │    │
│  │  ████████████░░░ 85%    │    │
│  │  $152.50 to weekly goal │    │
│  └─────────────────────────┘    │
│                                 │
│  BREAKDOWN                      │
│  Mon:  $142.50  (3 signups)     │
│  Tue:  $190.00  (4 signups)     │
│  Wed:  $95.00   (2 signups)     │
│  Thu:  $237.50  (5 signups)     │
│  Fri:  $127.50  (3 signups)     │
│  Sat:  --                       │
│  Sun:  --                       │
│                                 │
│  PENDING PAYOUT                 │
│  Next payday: Friday            │
│  Amount: $847.50                │
└─────────────────────────────────┘
```

**What it does:**
- Real-time earnings (not delayed)
- Daily breakdown
- Progress to goals
- Clear payout info

---

### 7. QUICK REFERENCE

```
┌─────────────────────────────────┐
│  📚 Quick Reference             │
│  ───────────────────────────    │
│                                 │
│  [🎯 Opening Script]            │
│  [💬 The Pitch]                 │
│  [🛡️ Objection Handlers]        │
│  [✅ Qualifying Benefits]       │
│  [📋 Do's and Don'ts]           │
│  [📞 Manager Hotline]           │
│                                 │
└─────────────────────────────────┘
```

**What it does:**
- All training materials in pocket
- Searchable
- Works offline

---

### 8. MANAGER DASHBOARD (Web)

```
┌────────────────────────────────────────────────────┐
│  EMG Manager Dashboard                              │
│  ────────────────────────────────────────          │
│                                                    │
│  TODAY: Jan 26, 2026                               │
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ ACTIVE   │ │ SIGNUPS  │ │ kWh      │            │
│  │   8      │ │   23     │ │ 241,500  │            │
│  │ reps     │ │ today    │ │ captured │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                    │
│  LIVE MAP                    TOP PERFORMERS        │
│  ┌─────────────────────┐    ┌─────────────────┐    │
│  │                     │    │ 1. DeShawn  7   │    │
│  │  [Territory Map     │    │ 2. Maria    5   │    │
│  │   with rep dots]    │    │ 3. Jaylen   4   │    │
│  │                     │    │ 4. Marcus   3   │    │
│  │   📍📍  📍          │    │ 5. Keisha   2   │    │
│  │      📍    📍       │    │ 6. Devon    2   │    │
│  │                     │    └─────────────────┘    │
│  └─────────────────────┘                          │
│                                                    │
│  TERRITORY STATUS                                  │
│  ┌────────────────────────────────────────────┐    │
│  │ HAM-001 Langley     █████████░ 87%  Marcus │    │
│  │ HAM-002 Sulik       ███░░░░░░░ 32%  Maria  │    │
│  │ NN-001 Warwick      ░░░░░░░░░░ 0%   --     │    │
│  └────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────┘
```

---

## Technical Architecture

### Mobile App
- **Framework:** React Native (iOS + Android from one codebase)
- **Offline:** SQLite local DB + background sync
- **Maps:** Mapbox or Google Maps SDK
- **Camera:** Native OCR for bill scanning
- **Push:** Firebase Cloud Messaging

### Backend
- **API:** Node.js + Express or Supabase
- **Database:** PostgreSQL
- **Auth:** Phone number + OTP (reps don't have emails)
- **Real-time:** WebSockets for live leaderboard
- **Storage:** S3 for bill images

### Data Model
```
Users (reps)
├── id, name, phone, team_id
├── current_territory_id
└── created_at

Territories
├── id, name, boundaries (GeoJSON)
├── estimated_units, status
└── assigned_to (user_id)

Doors
├── id, territory_id, address
├── lat/lng, status
├── knocked_at, knocked_by
└── notes

Signups
├── id, door_id, rep_id
├── customer_name, phone
├── benefit_type, account_number
├── bill_image_url
├── status (pending/verified/rejected)
├── commission_amount
└── created_at

Earnings
├── id, user_id, signup_id
├── amount, status (pending/paid)
└── payout_date
```

---

## MVP Scope (v1.0)

### Must Have
- [ ] Today view with earnings
- [ ] Territory map with door pins
- [ ] Door logging (5 outcomes)
- [ ] Signup capture form
- [ ] Bill camera scan
- [ ] Offline mode
- [ ] Basic leaderboard
- [ ] Quick reference scripts

### Nice to Have (v1.1)
- [ ] Push notifications
- [ ] Manager dashboard
- [ ] Route optimization
- [ ] Team chat
- [ ] Achievement badges

### Future (v2.0)
- [ ] AI qualification helper
- [ ] Auto-territory assignment
- [ ] Predictive analytics
- [ ] Integration with enrollment systems

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Doors logged per rep per day | 100+ |
| Time to log a door | <3 seconds |
| Signup submission time | <60 seconds |
| App crash rate | <0.1% |
| Offline reliability | 99.9% |
| Rep adoption | 100% |

---

## Development Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Design | 1 week | Figma mockups, user flows |
| MVP Build | 3 weeks | Core app (door logging, signups, map) |
| Testing | 1 week | Field testing with 3-5 reps |
| Launch | - | Full team rollout |
| Iterate | Ongoing | Based on rep feedback |

---

*Built for reps, by understanding what they need in the field.*
