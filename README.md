# Suno YouTube Music Catalog & Radio Station Manager

A local web app to organize Suno songs, build albums, generate YouTube metadata, plan radio blocks, and track monetization safety.

## Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (`better-sqlite3`)

## Included features
1. **Music Library**
   - Add/edit/delete songs
   - Stores title, artist, genre/subgenre, mood, BPM, key, vocals/instrumental, language, Suno prompt/date, paid-plan confirmation, commercial notes, streaming links, media paths, YouTube status, album assignment, radio priority, and monetization checklist fields
2. **Genre Organization**
   - Default genres: Afrobeats, Gospel, R&B, Hip-Hop, Pop, Reggae, Dancehall, EDM, Lofi, Jazz, Soul, Country, Cinematic, Worship, Instrumental, Experimental
3. **Album Builder**
   - Generate album title ideas
   - Generate track order with 8–12 track target
   - Save album metadata
4. **YouTube Upload Planner**
   - Generates title, description, hashtags, tags, thumbnail text, pinned comment, playlist name, Shorts idea, community post, release date, premiere flag
5. **Radio Station Planner**
   - Generate/safe-save 1H, 3H, 8H, 24H plans
   - Genre- or mood-based curation
   - Chapter timestamps and repeat-avoidance
6. **Monetization Safety**
   - Dashboard warning counter for risky tracks
   - Checklist fields to validate rights, samples, visuals, originality statement, and added value
7. **Dashboard**
   - Total songs, songs by genre, albums created, videos ready, videos needing metadata, radio playlists ready, monetization-risk warnings
8. **Export**
   - CSV/JSON exports for songs, albums, YouTube metadata sheet, album release sheet, radio schedule

## Project structure
```
.
├── client/                        # React app
├── server/                        # Express API + SQLite
├── youtube-channel-structure.md   # Channel strategy/template guide
└── README.md
```

## Setup
1. Install dependencies
```bash
npm install
npm run install:all
```

2. Initialize DB (schema + sample data)
```bash
npm run init-db --workspace server
```

3. Run both frontend and backend
```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000

## API overview
- `GET /api/genres`
- `GET /api/songs`
- `POST /api/songs`
- `PUT /api/songs/:id`
- `DELETE /api/songs/:id`
- `POST /api/albums/generate`
- `POST /api/albums`
- `GET /api/albums`
- `POST /api/upload-plans/generate/:songId`
- `POST /api/radio/generate`
- `GET /api/radio-blocks`
- `GET /api/dashboard`
- `GET /api/export/:type?format=csv|json`

## Export `:type` values
- `songs`
- `albums`
- `upload_metadata`
- `album_release`
- `radio_schedule`
