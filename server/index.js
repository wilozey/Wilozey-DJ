import express from 'express';
import cors from 'cors';
import db from './db.js';
import { schemaSql } from './schema.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

db.exec(schemaSql);

const GENRES = [
  'Afrobeats', 'Gospel', 'R&B', 'Hip-Hop', 'Pop', 'Reggae', 'Dancehall', 'EDM',
  'Lofi', 'Jazz', 'Soul', 'Country', 'Cinematic', 'Worship', 'Instrumental', 'Experimental'
];

const songColumns = `
 title, artist_project_name, genre, subgenre, mood, bpm, musical_key, vocals_type, language,
 suno_prompt, suno_creation_date, paid_plan_confirmation, commercial_rights_notes, streaming_links,
 audio_file_path, cover_art_path, youtube_video_status, album_assignment, radio_rotation_priority,
 monetization_confirm_rights, monetization_confirm_no_samples, monetization_confirm_visuals,
 monetization_confirm_description, monetization_added_value
`;

app.get('/api/genres', (_req, res) => res.json(GENRES));

app.get('/api/songs', (_req, res) => {
  const rows = db.prepare('SELECT * FROM songs ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/songs', (req, res) => {
  const insert = db.prepare(`INSERT INTO songs (${songColumns}) VALUES (
    @title, @artist_project_name, @genre, @subgenre, @mood, @bpm, @musical_key, @vocals_type, @language,
    @suno_prompt, @suno_creation_date, @paid_plan_confirmation, @commercial_rights_notes, @streaming_links,
    @audio_file_path, @cover_art_path, @youtube_video_status, @album_assignment, @radio_rotation_priority,
    @monetization_confirm_rights, @monetization_confirm_no_samples, @monetization_confirm_visuals,
    @monetization_confirm_description, @monetization_added_value
  )`);

  const payload = {
    ...req.body,
    streaming_links: typeof req.body.streaming_links === 'string' ? req.body.streaming_links : JSON.stringify(req.body.streaming_links || {})
  };
  const result = insert.run(payload);
  res.status(201).json(db.prepare('SELECT * FROM songs WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/songs/:id', (req, res) => {
  const { id } = req.params;
  const update = db.prepare(`UPDATE songs SET
    title=@title,
    artist_project_name=@artist_project_name,
    genre=@genre,
    subgenre=@subgenre,
    mood=@mood,
    bpm=@bpm,
    musical_key=@musical_key,
    vocals_type=@vocals_type,
    language=@language,
    suno_prompt=@suno_prompt,
    suno_creation_date=@suno_creation_date,
    paid_plan_confirmation=@paid_plan_confirmation,
    commercial_rights_notes=@commercial_rights_notes,
    streaming_links=@streaming_links,
    audio_file_path=@audio_file_path,
    cover_art_path=@cover_art_path,
    youtube_video_status=@youtube_video_status,
    album_assignment=@album_assignment,
    radio_rotation_priority=@radio_rotation_priority,
    monetization_confirm_rights=@monetization_confirm_rights,
    monetization_confirm_no_samples=@monetization_confirm_no_samples,
    monetization_confirm_visuals=@monetization_confirm_visuals,
    monetization_confirm_description=@monetization_confirm_description,
    monetization_added_value=@monetization_added_value,
    updated_at=CURRENT_TIMESTAMP
    WHERE id=@id
  `);

  const payload = {
    ...req.body,
    id,
    streaming_links: typeof req.body.streaming_links === 'string' ? req.body.streaming_links : JSON.stringify(req.body.streaming_links || {})
  };

  update.run(payload);
  res.json(db.prepare('SELECT * FROM songs WHERE id = ?').get(id));
});

app.delete('/api/songs/:id', (req, res) => {
  db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

const albumTitleIdeas = {
  genre: (v) => [`${v} Pulse Vol. 1`, `${v} Nights`, `${v} Essentials`, `The ${v} Sessions`],
  mood: (v) => [`${v} Frequencies`, `${v} Atmospheres`, `${v} Moodwaves`, `${v} Soundtrack`]
};

app.post('/api/albums/generate', (req, res) => {
  const { focusType, focusValue, trackCount = 10 } = req.body;
  const songs = db.prepare(`SELECT * FROM songs WHERE ${focusType === 'genre' ? 'genre' : 'mood'} = ? ORDER BY radio_rotation_priority DESC, created_at ASC`).all(focusValue);
  const selected = songs.slice(0, Math.max(8, Math.min(12, trackCount)));

  const tracks = selected.map((song, index) => ({ track: index + 1, song_id: song.id, title: song.title }));
  const titleIdeas = (albumTitleIdeas[focusType] || (() => []))(focusValue);

  res.json({ titleIdeas, trackOrder: tracks });
});

app.post('/api/albums', (req, res) => {
  const insert = db.prepare(`INSERT INTO albums (title, focus_type, focus_value, track_count_target, generated_track_order, metadata_json)
    VALUES (@title, @focus_type, @focus_value, @track_count_target, @generated_track_order, @metadata_json)`);
  const result = insert.run({
    ...req.body,
    generated_track_order: JSON.stringify(req.body.generated_track_order || []),
    metadata_json: JSON.stringify(req.body.metadata_json || {})
  });
  res.status(201).json(db.prepare('SELECT * FROM albums WHERE id=?').get(result.lastInsertRowid));
});

app.get('/api/albums', (_req, res) => res.json(db.prepare('SELECT * FROM albums ORDER BY created_at DESC').all()));

app.post('/api/upload-plans/generate/:songId', (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id=?').get(req.params.songId);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  const plan = {
    youtube_title: `${song.title} | ${song.genre} ${song.mood || ''} Vibes`,
    description: `Original ${song.genre} track by ${song.artist_project_name}. Created with Suno and curated for YouTube with custom visual identity.`,
    hashtags: `#${song.genre.replace(/[^a-z0-9]/gi, '')} #OriginalMusic #Suno`,
    tags: `${song.genre},${song.subgenre || ''},${song.mood || ''},original music,suno music,youtube music`,
    thumbnail_text: `${song.genre} ${song.mood || ''}`.trim(),
    pinned_comment: 'Thanks for listening. Comment your favorite timestamp and mood!',
    playlist_name: `${song.genre} Radio Essentials`,
    shorts_idea: `15s drop preview of "${song.title}" with animated waveform and CTA to full video.`,
    community_post: `New drop: ${song.title}. Should this go into a longer ${song.genre} radio mix?`,
    release_date: new Date().toISOString().slice(0, 10),
    is_premiere: song.youtube_video_status === 'ready' ? 1 : 0
  };

  res.json(plan);
});

app.post('/api/radio/generate', (req, res) => {
  const { blockType, blockValue, durationHours } = req.body;
  const songs = db.prepare(`SELECT * FROM songs WHERE ${blockType === 'genre' ? 'genre' : 'mood'} = ? ORDER BY radio_rotation_priority DESC, id ASC`).all(blockValue);
  if (!songs.length) return res.status(400).json({ error: 'No songs found for this filter.' });

  const targetMinutes = durationHours * 60;
  let minuteCursor = 0;
  let i = 0;
  const chapters = [];
  const picked = [];

  while (minuteCursor < targetMinutes) {
    const song = songs[i % songs.length];
    if (picked.length < 1 || picked[picked.length - 1] !== song.id) {
      picked.push(song.id);
      const hh = String(Math.floor(minuteCursor / 60)).padStart(2, '0');
      const mm = String(minuteCursor % 60).padStart(2, '0');
      chapters.push(`${hh}:${mm}:00 ${song.title}`);
      minuteCursor += 4;
    }
    i += 1;
  }

  res.json({
    title: `${blockValue} ${durationHours}H Radio`,
    description: `Continuous ${blockValue} stream curated from your Suno catalog for ${durationHours} hours.`,
    tags: `${blockValue},radio,24/7 music,background music,original music`,
    chapter_timestamps: chapters,
    song_ids: picked
  });
});

app.get('/api/dashboard', (_req, res) => {
  const totalSongs = db.prepare('SELECT COUNT(*) as c FROM songs').get().c;
  const songsByGenre = db.prepare('SELECT genre, COUNT(*) as count FROM songs GROUP BY genre ORDER BY count DESC').all();
  const albumsCreated = db.prepare('SELECT COUNT(*) as c FROM albums').get().c;
  const videosReady = db.prepare("SELECT COUNT(*) as c FROM songs WHERE youtube_video_status = 'ready'").get().c;
  const videosNeedMeta = db.prepare("SELECT COUNT(*) as c FROM songs WHERE youtube_video_status = 'metadata-needed'").get().c;
  const riskWarnings = db.prepare(`SELECT COUNT(*) as c FROM songs WHERE
    monetization_confirm_rights = 0 OR
    monetization_confirm_no_samples = 0 OR
    monetization_confirm_visuals = 0 OR
    monetization_confirm_description = 0 OR
    monetization_added_value = 0
  `).get().c;

  res.json({
    totalSongs,
    songsByGenre,
    albumsCreated,
    videosReady,
    videosNeedMeta,
    radioPlaylistsReady: db.prepare('SELECT COUNT(*) as c FROM radio_blocks').get().c,
    monetizationRiskWarnings: riskWarnings
  });
});

function jsonToCsv(rows) {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
}

app.get('/api/export/:type', (req, res) => {
  const { type } = req.params;
  const map = {
    songs: 'SELECT * FROM songs',
    albums: 'SELECT * FROM albums',
    upload_metadata: 'SELECT * FROM upload_plans',
    album_release: 'SELECT * FROM albums',
    radio_schedule: 'SELECT * FROM radio_blocks'
  };
  const query = map[type];
  if (!query) return res.status(400).json({ error: 'Unknown export type' });
  const rows = db.prepare(query).all();

  if (req.query.format === 'json') {
    return res.json(rows);
  }

  const csv = jsonToCsv(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment(`${type}.csv`);
  res.send(csv);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
