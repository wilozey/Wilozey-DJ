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

const songColumns = [
  'title', 'artist_project_name', 'genre', 'subgenre', 'mood', 'bpm', 'musical_key', 'vocals_type', 'language',
  'suno_prompt', 'suno_creation_date', 'paid_plan_confirmation', 'commercial_rights_notes', 'streaming_links',
  'audio_file_path', 'cover_art_path', 'youtube_video_status', 'album_assignment', 'radio_rotation_priority',
  'monetization_confirm_rights', 'monetization_confirm_no_samples', 'monetization_confirm_visuals',
  'monetization_confirm_description', 'monetization_added_value'
];

const defaults = {
  paid_plan_confirmation: 0,
  radio_rotation_priority: 3,
  vocals_type: 'vocals',
  youtube_video_status: 'draft',
  monetization_confirm_rights: 0,
  monetization_confirm_no_samples: 0,
  monetization_confirm_visuals: 0,
  monetization_confirm_description: 0,
  monetization_added_value: 0
};

const normalizeSongInput = (body) => ({
  ...defaults,
  ...body,
  streaming_links: typeof body.streaming_links === 'string' ? body.streaming_links : JSON.stringify(body.streaming_links || {})
});

const monetizationRiskExpr = `
  paid_plan_confirmation = 0 OR
  monetization_confirm_rights = 0 OR
  monetization_confirm_no_samples = 0 OR
  monetization_confirm_visuals = 0 OR
  monetization_confirm_description = 0 OR
  monetization_added_value = 0
`;

app.get('/api/genres', (_req, res) => res.json(GENRES));

app.get('/api/songs', (req, res) => {
  const status = req.query.status;
  const where = status ? 'WHERE youtube_video_status = ?' : '';
  const rows = db.prepare(`SELECT * FROM songs ${where} ORDER BY created_at DESC, id DESC`).all(...(status ? [status] : []));
  res.json(rows);
});

app.post('/api/songs', (req, res) => {
  const payload = normalizeSongInput(req.body);
  const placeholders = songColumns.map((col) => `@${col}`).join(', ');
  const insert = db.prepare(`INSERT INTO songs (${songColumns.join(', ')}) VALUES (${placeholders})`);
  const result = insert.run(payload);
  res.status(201).json(db.prepare('SELECT * FROM songs WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/songs/:id', (req, res) => {
  const { id } = req.params;
  const exists = db.prepare('SELECT id FROM songs WHERE id = ?').get(id);
  if (!exists) return res.status(404).json({ error: 'Song not found.' });

  const payload = { id, ...normalizeSongInput(req.body) };
  const setExpr = songColumns.map((col) => `${col}=@${col}`).join(', ');
  db.prepare(`UPDATE songs SET ${setExpr}, updated_at=CURRENT_TIMESTAMP WHERE id=@id`).run(payload);
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
  if (!['genre', 'mood'].includes(focusType)) {
    return res.status(400).json({ error: 'focusType must be genre or mood.' });
  }

  const selected = db.prepare(`
    SELECT * FROM songs WHERE ${focusType} = ?
    ORDER BY radio_rotation_priority DESC, youtube_video_status='ready' DESC, id ASC
  `).all(focusValue).slice(0, Math.max(8, Math.min(12, trackCount)));

  const trackOrder = selected.map((song, index) => ({ track: index + 1, song_id: song.id, title: song.title }));
  const titleIdeas = (albumTitleIdeas[focusType] || (() => []))(focusValue);
  res.json({ titleIdeas, trackOrder });
});

app.post('/api/albums', (req, res) => {
  const { title, focus_type, focus_value, track_count_target, generated_track_order, metadata_json } = req.body;
  const result = db.prepare(`
    INSERT INTO albums (title, focus_type, focus_value, track_count_target, generated_track_order, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    title,
    focus_type,
    focus_value,
    track_count_target || 10,
    JSON.stringify(generated_track_order || []),
    JSON.stringify(metadata_json || {})
  );
  res.status(201).json(db.prepare('SELECT * FROM albums WHERE id = ?').get(result.lastInsertRowid));
});

app.get('/api/albums', (_req, res) => {
  const rows = db.prepare('SELECT * FROM albums ORDER BY created_at DESC, id DESC').all();
  res.json(rows.map((row) => ({
    ...row,
    generated_track_order: JSON.parse(row.generated_track_order || '[]'),
    metadata_json: JSON.parse(row.metadata_json || '{}')
  })));
});

app.post('/api/upload-plans/generate/:songId', (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.songId);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  const releaseDate = req.body.releaseDate || new Date().toISOString().slice(0, 10);
  const plan = {
    song_id: song.id,
    youtube_title: `${song.title} | ${song.genre} ${song.mood || ''} Vibes`.trim(),
    description: `Original ${song.genre} track by ${song.artist_project_name}.\n\nThis upload is curated with custom visuals/branding.\n\n#OriginalMusic #Suno`,
    hashtags: `#${song.genre.replace(/[^a-z0-9]/gi, '')} #OriginalMusic #Suno`,
    tags: `${song.genre},${song.subgenre || ''},${song.mood || ''},original music,suno music,youtube music`,
    thumbnail_text: `${song.genre} ${song.mood || ''}`.trim(),
    pinned_comment: 'Thanks for listening! Which mood/genre should drop next?',
    playlist_name: `${song.genre} Radio Essentials`,
    shorts_idea: `Post a 15-second drop from "${song.title}" with CTA to full release.`,
    community_post: `New drop: ${song.title}. Want this in the next ${song.genre} radio mix?`,
    release_date: releaseDate,
    is_premiere: song.youtube_video_status === 'ready' ? 1 : 0
  };

  if (req.body.save) {
    db.prepare(`INSERT INTO upload_plans (
      song_id, youtube_title, description, hashtags, tags, thumbnail_text,
      pinned_comment, playlist_name, shorts_idea, community_post, release_date, is_premiere
    ) VALUES (
      @song_id, @youtube_title, @description, @hashtags, @tags, @thumbnail_text,
      @pinned_comment, @playlist_name, @shorts_idea, @community_post, @release_date, @is_premiere
    )`).run(plan);
  }

  res.json(plan);
});

app.post('/api/radio/generate', (req, res) => {
  const { blockType, blockValue, durationHours, save } = req.body;
  if (!['genre', 'mood'].includes(blockType)) {
    return res.status(400).json({ error: 'blockType must be genre or mood.' });
  }

  const songs = db.prepare(`
    SELECT * FROM songs WHERE ${blockType} = ?
    ORDER BY radio_rotation_priority DESC, youtube_video_status='ready' DESC, id ASC
  `).all(blockValue);

  if (!songs.length) return res.status(400).json({ error: 'No songs found for this filter.' });

  const targetMinutes = durationHours * 60;
  let minuteCursor = 0;
  const chapters = [];
  const songIds = [];
  let cursor = 0;

  while (minuteCursor < targetMinutes) {
    const song = songs[cursor % songs.length];
    const previous = songIds[songIds.length - 1];
    if (song.id !== previous) {
      songIds.push(song.id);
      const hh = String(Math.floor(minuteCursor / 60)).padStart(2, '0');
      const mm = String(minuteCursor % 60).padStart(2, '0');
      chapters.push(`${hh}:${mm}:00 ${song.title}`);
      minuteCursor += 4;
    }
    cursor += 1;
  }

  const plan = {
    title: `${blockValue} ${durationHours}H Radio`,
    description: `Continuous ${blockValue} stream curated from your Suno catalog for ${durationHours} hours.`,
    tags: `${blockValue},radio,24/7 music,background music,original music`,
    chapter_timestamps: chapters,
    song_ids: songIds
  };

  if (save) {
    db.prepare(`
      INSERT INTO radio_blocks (title, description, block_type, block_value, duration_hours, song_ids, tags, chapter_timestamps)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      plan.title,
      plan.description,
      blockType,
      blockValue,
      durationHours,
      JSON.stringify(songIds),
      plan.tags,
      JSON.stringify(chapters)
    );
  }

  res.json(plan);
});

app.get('/api/radio-blocks', (_req, res) => {
  const rows = db.prepare('SELECT * FROM radio_blocks ORDER BY created_at DESC, id DESC').all();
  res.json(rows.map((row) => ({
    ...row,
    song_ids: JSON.parse(row.song_ids || '[]'),
    chapter_timestamps: JSON.parse(row.chapter_timestamps || '[]')
  })));
});

app.get('/api/dashboard', (_req, res) => {
  const totalSongs = db.prepare('SELECT COUNT(*) as c FROM songs').get().c;
  const songsByGenre = db.prepare('SELECT genre, COUNT(*) as count FROM songs GROUP BY genre ORDER BY count DESC').all();
  const albumsCreated = db.prepare('SELECT COUNT(*) as c FROM albums').get().c;
  const videosReady = db.prepare("SELECT COUNT(*) as c FROM songs WHERE youtube_video_status = 'ready'").get().c;
  const videosNeedMeta = db.prepare("SELECT COUNT(*) as c FROM songs WHERE youtube_video_status IN ('draft', 'metadata-needed')").get().c;
  const radioPlaylistsReady = db.prepare('SELECT COUNT(*) as c FROM radio_blocks').get().c;
  const monetizationRiskWarnings = db.prepare(`SELECT COUNT(*) as c FROM songs WHERE ${monetizationRiskExpr}`).get().c;

  res.json({ totalSongs, songsByGenre, albumsCreated, videosReady, videosNeedMeta, radioPlaylistsReady, monetizationRiskWarnings });
});

const csvValue = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
function jsonToCsv(rows) {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  return [keys.join(','), ...rows.map((row) => keys.map((key) => csvValue(row[key])).join(','))].join('\n');
}

app.get('/api/export/:type', (req, res) => {
  const map = {
    songs: 'SELECT * FROM songs',
    albums: 'SELECT * FROM albums',
    upload_metadata: 'SELECT * FROM upload_plans',
    album_release: 'SELECT id,title,focus_type,focus_value,track_count_target,created_at FROM albums',
    radio_schedule: 'SELECT * FROM radio_blocks'
  };

  const query = map[req.params.type];
  if (!query) return res.status(400).json({ error: 'Unknown export type.' });

  const rows = db.prepare(query).all();
  if (req.query.format === 'json') return res.json(rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.type}.csv"`);
  res.send(jsonToCsv(rows));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
