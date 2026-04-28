export const schemaSql = `
CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist_project_name TEXT NOT NULL,
  genre TEXT NOT NULL,
  subgenre TEXT,
  mood TEXT,
  bpm INTEGER,
  musical_key TEXT,
  vocals_type TEXT CHECK (vocals_type IN ('vocals', 'instrumental')) DEFAULT 'vocals',
  language TEXT,
  suno_prompt TEXT,
  suno_creation_date TEXT,
  paid_plan_confirmation INTEGER DEFAULT 0,
  commercial_rights_notes TEXT,
  streaming_links TEXT,
  audio_file_path TEXT,
  cover_art_path TEXT,
  youtube_video_status TEXT DEFAULT 'draft',
  album_assignment TEXT,
  radio_rotation_priority INTEGER DEFAULT 3,
  monetization_confirm_rights INTEGER DEFAULT 0,
  monetization_confirm_no_samples INTEGER DEFAULT 0,
  monetization_confirm_visuals INTEGER DEFAULT 0,
  monetization_confirm_description INTEGER DEFAULT 0,
  monetization_added_value INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  focus_type TEXT CHECK (focus_type IN ('genre', 'mood')) NOT NULL,
  focus_value TEXT NOT NULL,
  track_count_target INTEGER DEFAULT 10,
  generated_track_order TEXT,
  metadata_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upload_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER,
  album_id INTEGER,
  youtube_title TEXT,
  description TEXT,
  hashtags TEXT,
  tags TEXT,
  thumbnail_text TEXT,
  pinned_comment TEXT,
  playlist_name TEXT,
  shorts_idea TEXT,
  community_post TEXT,
  release_date TEXT,
  is_premiere INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE,
  FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS radio_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  block_type TEXT CHECK (block_type IN ('genre', 'mood')) NOT NULL,
  block_value TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  song_ids TEXT,
  tags TEXT,
  chapter_timestamps TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;
