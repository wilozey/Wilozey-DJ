import React, { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:4000/api';

const emptySong = {
  title: '', artist_project_name: 'Wilozey DJ Studio', genre: 'Afrobeats', subgenre: '', mood: '', bpm: 100,
  musical_key: 'Am', vocals_type: 'vocals', language: 'English', suno_prompt: '', suno_creation_date: '',
  paid_plan_confirmation: 1, commercial_rights_notes: '', streaming_links: '{}', audio_file_path: '', cover_art_path: '',
  youtube_video_status: 'draft', album_assignment: '', radio_rotation_priority: 3,
  monetization_confirm_rights: 0, monetization_confirm_no_samples: 0, monetization_confirm_visuals: 0,
  monetization_confirm_description: 0, monetization_added_value: 0
};

export default function App() {
  const [songs, setSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [song, setSong] = useState(emptySong);
  const [uploadPlan, setUploadPlan] = useState(null);
  const [radioPlan, setRadioPlan] = useState(null);

  const fetchAll = async () => {
    const [songsRes, genresRes, dashRes] = await Promise.all([
      fetch(`${API}/songs`).then((r) => r.json()),
      fetch(`${API}/genres`).then((r) => r.json()),
      fetch(`${API}/dashboard`).then((r) => r.json())
    ]);
    setSongs(songsRes);
    setGenres(genresRes);
    setDashboard(dashRes);
  };

  useEffect(() => { fetchAll(); }, []);

  const byGenre = useMemo(() => {
    const map = {};
    songs.forEach((s) => { map[s.genre] = (map[s.genre] || 0) + 1; });
    return map;
  }, [songs]);

  const submitSong = async (e) => {
    e.preventDefault();
    await fetch(`${API}/songs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(song)
    });
    setSong(emptySong);
    fetchAll();
  };

  const removeSong = async (id) => {
    await fetch(`${API}/songs/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const generateUpload = async (songId) => {
    const data = await fetch(`${API}/upload-plans/generate/${songId}`, { method: 'POST' }).then((r) => r.json());
    setUploadPlan(data);
  };

  const generateRadio = async (blockType, blockValue, durationHours) => {
    const data = await fetch(`${API}/radio/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockType, blockValue, durationHours })
    }).then((r) => r.json());
    setRadioPlan(data.error ? null : data);
  };

  return (
    <div className="layout">
      <header>
        <h1>Suno → YouTube Catalog & Radio Manager</h1>
      </header>

      {dashboard && (
        <section className="grid cards">
          <Card title="Total Songs" value={dashboard.totalSongs} />
          <Card title="Albums Created" value={dashboard.albumsCreated} />
          <Card title="Videos Ready" value={dashboard.videosReady} />
          <Card title="Needs Metadata" value={dashboard.videosNeedMeta} />
          <Card title="Radio Ready" value={dashboard.radioPlaylistsReady} />
          <Card title="Monetization Risks" value={dashboard.monetizationRiskWarnings} danger />
        </section>
      )}

      <section className="panel">
        <h2>Add Song</h2>
        <form className="form" onSubmit={submitSong}>
          <input required placeholder="Song title" value={song.title} onChange={(e) => setSong({ ...song, title: e.target.value })} />
          <input required placeholder="Artist/project" value={song.artist_project_name} onChange={(e) => setSong({ ...song, artist_project_name: e.target.value })} />
          <select value={song.genre} onChange={(e) => setSong({ ...song, genre: e.target.value })}>
            {genres.map((g) => <option key={g}>{g}</option>)}
          </select>
          <input placeholder="Mood" value={song.mood} onChange={(e) => setSong({ ...song, mood: e.target.value })} />
          <input placeholder="Album assignment" value={song.album_assignment} onChange={(e) => setSong({ ...song, album_assignment: e.target.value })} />
          <input placeholder="Suno creation date (YYYY-MM-DD)" value={song.suno_creation_date} onChange={(e) => setSong({ ...song, suno_creation_date: e.target.value })} />
          <button type="submit">Save Song</button>
        </form>
      </section>

      <section className="grid two-col">
        <div className="panel">
          <h2>Music Library ({songs.length})</h2>
          <ul className="list">
            {songs.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.genre} • {s.mood || 'N/A'} • {s.youtube_video_status}</p>
                </div>
                <div className="row">
                  <button onClick={() => generateUpload(s.id)}>Upload Plan</button>
                  <button className="danger" onClick={() => removeSong(s.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h2>Genres</h2>
          <ul className="list compact">
            {genres.map((g) => <li key={g}><span>{g}</span><strong>{byGenre[g] || 0}</strong></li>)}
          </ul>
          <h3>Radio Planner</h3>
          <div className="row">
            <button onClick={() => generateRadio('genre', 'Afrobeats', 1)}>1H Afrobeats</button>
            <button onClick={() => generateRadio('genre', 'Lofi', 3)}>3H Lofi</button>
            <button onClick={() => generateRadio('mood', 'Chill', 8)}>8H Chill</button>
            <button onClick={() => generateRadio('genre', 'EDM', 24)}>24H EDM</button>
          </div>
        </div>
      </section>

      {uploadPlan && (
        <section className="panel">
          <h2>YouTube Upload Planner</h2>
          <pre>{JSON.stringify(uploadPlan, null, 2)}</pre>
        </section>
      )}

      {radioPlan && (
        <section className="panel">
          <h2>Radio Block</h2>
          <pre>{JSON.stringify(radioPlan, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}

function Card({ title, value, danger }) {
  return <div className={`card ${danger ? 'danger' : ''}`}><p>{title}</p><h3>{value}</h3></div>;
}
