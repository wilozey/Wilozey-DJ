# Suno YouTube Music Catalog & Radio Station Manager

Local web app to organize Suno songs, plan YouTube uploads, generate albums/radio blocks, and track monetization safety.

## Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (`better-sqlite3`)

## Features included
- Music Library CRUD with Suno/YouTube/commercial-rights metadata
- Default genre set:
  - Afrobeats, Gospel, R&B, Hip-Hop, Pop, Reggae, Dancehall, EDM, Lofi, Jazz, Soul, Country, Cinematic, Worship, Instrumental, Experimental
- Album builder API with title ideas + track-order generation (8–12 tracks)
- YouTube upload metadata generator:
  - title, description, hashtags, tags, thumbnail text, pinned comment, playlist name, Shorts idea, community post, release date, premiere flag
- Radio station planner:
  - genre/mood blocks with 1h, 3h, 8h, 24h scheduling logic and chapter timestamps
- Monetization safety fields and dashboard risk warning count
- Dashboard counters
- Export endpoints for CSV/JSON:
  - songs, albums, upload metadata sheet, album release sheet, radio schedule
- Seed/sample data included

## Project structure
```
.
├── client/         # React app
├── server/         # Express API + SQLite
└── README.md
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   npm run install:all
   ```
2. Initialize DB (schema + sample songs):
   ```bash
   npm run init-db --workspace server
   ```
3. Run app in dev mode:
   ```bash
   npm run dev
   ```
4. Open frontend:
   - http://localhost:5173
5. API runs at:
   - http://localhost:4000

## Useful API endpoints
- `GET /api/songs`
- `POST /api/songs`
- `PUT /api/songs/:id`
- `DELETE /api/songs/:id`
- `POST /api/albums/generate`
- `POST /api/albums`
- `GET /api/albums`
- `POST /api/upload-plans/generate/:songId`
- `POST /api/radio/generate`
- `GET /api/dashboard`
- `GET /api/export/:type?format=csv|json`

### Export types
- `songs`
- `albums`
- `upload_metadata`
- `album_release`
- `radio_schedule`

## Notes
- This starter keeps UI intentionally clean and lightweight.
- You can extend forms to expose every field inline, or add auth/user separation.
- For production, add validation, migration tooling, and durable storage backups.
