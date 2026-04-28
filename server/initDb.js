import db from './db.js';
import { schemaSql } from './schema.js';

db.exec(schemaSql);

const genres = [
  'Afrobeats', 'Gospel', 'R&B', 'Hip-Hop', 'Pop', 'Reggae', 'Dancehall', 'EDM',
  'Lofi', 'Jazz', 'Soul', 'Country', 'Cinematic', 'Worship', 'Instrumental', 'Experimental'
];

const count = db.prepare('SELECT COUNT(*) as count FROM songs').get().count;
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO songs (
      title, artist_project_name, genre, subgenre, mood, bpm, musical_key, vocals_type,
      language, suno_prompt, suno_creation_date, paid_plan_confirmation,
      commercial_rights_notes, streaming_links, audio_file_path, cover_art_path,
      youtube_video_status, album_assignment, radio_rotation_priority,
      monetization_confirm_rights, monetization_confirm_no_samples,
      monetization_confirm_visuals, monetization_confirm_description, monetization_added_value
    ) VALUES (
      @title, @artist_project_name, @genre, @subgenre, @mood, @bpm, @musical_key, @vocals_type,
      @language, @suno_prompt, @suno_creation_date, @paid_plan_confirmation,
      @commercial_rights_notes, @streaming_links, @audio_file_path, @cover_art_path,
      @youtube_video_status, @album_assignment, @radio_rotation_priority,
      @monetization_confirm_rights, @monetization_confirm_no_samples,
      @monetization_confirm_visuals, @monetization_confirm_description, @monetization_added_value
    )
  `);

  const seedSongs = genres.slice(0, 10).map((genre, idx) => ({
    title: `${genre} Sunlight ${idx + 1}`,
    artist_project_name: 'Wilozey DJ Studio',
    genre,
    subgenre: `Modern ${genre}`,
    mood: idx % 2 === 0 ? 'Uplifting' : 'Chill',
    bpm: 90 + idx * 4,
    musical_key: ['C#m', 'G', 'Am', 'F', 'D'][idx % 5],
    vocals_type: idx % 3 === 0 ? 'instrumental' : 'vocals',
    language: 'English',
    suno_prompt: `Create a ${genre} song with polished modern production and emotional hooks`,
    suno_creation_date: `2026-03-${String(idx + 10).padStart(2, '0')}`,
    paid_plan_confirmation: 1,
    commercial_rights_notes: 'Created under paid Suno plan, verify release rights before distribution.',
    streaming_links: JSON.stringify({ spotify: '', appleMusic: '' }),
    audio_file_path: `/audio/${genre.toLowerCase().replace(/&/g, 'and')}-${idx + 1}.mp3`,
    cover_art_path: `/cover/${genre.toLowerCase().replace(/&/g, 'and')}-${idx + 1}.jpg`,
    youtube_video_status: idx % 2 === 0 ? 'ready' : 'metadata-needed',
    album_assignment: idx < 5 ? 'Golden Hour Sessions' : 'Night Drive Echoes',
    radio_rotation_priority: (idx % 5) + 1,
    monetization_confirm_rights: 1,
    monetization_confirm_no_samples: 1,
    monetization_confirm_visuals: idx % 2,
    monetization_confirm_description: 1,
    monetization_added_value: idx % 2
  }));

  const tx = db.transaction((rows) => rows.forEach((row) => insert.run(row)));
  tx(seedSongs);
}

console.log('Database initialized with schema and sample data.');
