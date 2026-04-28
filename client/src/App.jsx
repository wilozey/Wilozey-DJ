import React, { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:4000/api';

const blankSong = {
  title: '',
  artist_project_name: 'Wilozey DJ Studio',
  genre: 'Afrobeats',
  subgenre: '',
  mood: '',
  bpm: 100,
  musical_key: 'Am',
  vocals_type: 'vocals',
  language: 'English',
  suno_prompt: '',
  suno_creation_date: '',
  paid_plan_confirmation: 1,
  commercial_rights_notes: '',
  streaming_links: '{}',
  audio_file_path: '',
  cover_art_path: '',
  youtube_video_status: 'draft',
  album_assignment: '',
  radio_rotation_priority: 3,
  monetization_confirm_rights: 0,
  monetization_confirm_no_samples: 0,
  monetization_confirm_visuals: 0,
  monetization_confirm_description: 0,
  monetization_added_value: 0
};

export default function App() {
  const [songs, setSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [song, setSong] = useState(blankSong);
  const [editingId, setEditingId] = useState(null);
  const [uploadPlan, setUploadPlan] = useState(null);
  const [radioPlan, setRadioPlan] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [albumDraft, setAlbumDraft] = useState({ focusType: 'genre', focusValue: 'Afrobeats', trackCount: 10 });
  const [albumGenerated, setAlbumGenerated] = useState(null);

  const load = async () => {
    const [songsRes, genresRes, dashRes, albumsRes] = await Promise.all([
      fetch(`${API}/songs`).then((r) => r.json()),
      fetch(`${API}/genres`).then((r) => r.json()),
      fetch(`${API}/dashboard`).then((r) => r.json()),
      fetch(`${API}/albums`).then((r) => r.json())
    ]);
    setSongs(songsRes);
    setGenres(genresRes);
    setDashboard(dashRes);
    setAlbums(albumsRes);
  };

  useEffect(() => { load(); }, []);

  const genreCounts = useMemo(() => {
    const map = {};
    songs.forEach((s) => { map[s.genre] = (map[s.genre] || 0) + 1; });
    return map;
  }, [songs]);

  const handleSubmitSong = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API}/songs/${editingId}` : `${API}/songs`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song)
    });
    setSong(blankSong);
    setEditingId(null);
    load();
  };

  const handleEdit = (item) => {
    setSong({ ...item });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/songs/${id}`, { method: 'DELETE' });
    if (editingId === id) {
      setSong(blankSong);
      setEditingId(null);
    }
    load();
  };

  const generateUpload = async (songId) => {
    const plan = await fetch(`${API}/upload-plans/generate/${songId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ save: true })
    }).then((r) => r.json());
    setUploadPlan(plan);
    load();
  };

  const generateRadio = async (blockType, blockValue, durationHours) => {
    const plan = await fetch(`${API}/radio/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockType, blockValue, durationHours, save: true })
    }).then((r) => r.json());
    setRadioPlan(plan.error ? null : plan);
    load();
  };

  const generateAlbum = async () => {
    const result = await fetch(`${API}/albums/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(albumDraft)
    }).then((r) => r.json());
    setAlbumGenerated(result);
  };

  const saveAlbum = async () => {
    if (!albumGenerated?.trackOrder?.length) return;
    await fetch(`${API}/albums`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: albumGenerated.titleIdeas[0],
        focus_type: albumDraft.focusType,
        focus_value: albumDraft.focusValue,
        track_count_target: albumDraft.trackCount,
        generated_track_order: albumGenerated.trackOrder,
        metadata_json: { titleIdeas: albumGenerated.titleIdeas }
      })
    });
    load();
  };

  return (
    <div className="layout">
      <h1>Suno Catalog + YouTube Radio Management</h1>

      {dashboard && (
        <section className="grid cards">
          <Metric title="Total Songs" value={dashboard.totalSongs} />
          <Metric title="Albums" value={dashboard.albumsCreated} />
          <Metric title="Videos Ready" value={dashboard.videosReady} />
          <Metric title="Need Metadata" value={dashboard.videosNeedMeta} />
          <Metric title="Radio Ready" value={dashboard.radioPlaylistsReady} />
          <Metric title="Monetization Risk" value={dashboard.monetizationRiskWarnings} risk />
        </section>
      )}

      <section className="panel">
        <h2>{editingId ? 'Edit Song' : 'Add Song'}</h2>
        <form className="form" onSubmit={handleSubmitSong}>
          <input required placeholder="Song title" value={song.title} onChange={(e) => setSong({ ...song, title: e.target.value })} />
          <input required placeholder="Artist/project" value={song.artist_project_name} onChange={(e) => setSong({ ...song, artist_project_name: e.target.value })} />
          <select value={song.genre} onChange={(e) => setSong({ ...song, genre: e.target.value })}>{genres.map((g) => <option key={g}>{g}</option>)}</select>
          <input placeholder="Subgenre" value={song.subgenre || ''} onChange={(e) => setSong({ ...song, subgenre: e.target.value })} />
          <input placeholder="Mood" value={song.mood || ''} onChange={(e) => setSong({ ...song, mood: e.target.value })} />
          <input placeholder="BPM" type="number" value={song.bpm ?? ''} onChange={(e) => setSong({ ...song, bpm: Number(e.target.value) })} />
          <input placeholder="Key" value={song.musical_key || ''} onChange={(e) => setSong({ ...song, musical_key: e.target.value })} />
          <input placeholder="Language" value={song.language || ''} onChange={(e) => setSong({ ...song, language: e.target.value })} />
          <input placeholder="Album assignment" value={song.album_assignment || ''} onChange={(e) => setSong({ ...song, album_assignment: e.target.value })} />
          <input placeholder="Suno date (YYYY-MM-DD)" value={song.suno_creation_date || ''} onChange={(e) => setSong({ ...song, suno_creation_date: e.target.value })} />
          <textarea placeholder="Suno prompt" value={song.suno_prompt || ''} onChange={(e) => setSong({ ...song, suno_prompt: e.target.value })} />
          <textarea placeholder="Commercial rights notes" value={song.commercial_rights_notes || ''} onChange={(e) => setSong({ ...song, commercial_rights_notes: e.target.value })} />
          <label><input type="checkbox" checked={Boolean(song.paid_plan_confirmation)} onChange={(e) => setSong({ ...song, paid_plan_confirmation: e.target.checked ? 1 : 0 })} /> Paid plan confirmed</label>
          <label><input type="checkbox" checked={Boolean(song.monetization_confirm_rights)} onChange={(e) => setSong({ ...song, monetization_confirm_rights: e.target.checked ? 1 : 0 })} /> Commercial rights confirmed</label>
          <label><input type="checkbox" checked={Boolean(song.monetization_confirm_no_samples)} onChange={(e) => setSong({ ...song, monetization_confirm_no_samples: e.target.checked ? 1 : 0 })} /> No copyrighted samples/artist refs</label>
          <label><input type="checkbox" checked={Boolean(song.monetization_confirm_visuals)} onChange={(e) => setSong({ ...song, monetization_confirm_visuals: e.target.checked ? 1 : 0 })} /> Visuals original/licensed</label>
          <label><input type="checkbox" checked={Boolean(song.monetization_confirm_description)} onChange={(e) => setSong({ ...song, monetization_confirm_description: e.target.checked ? 1 : 0 })} /> Description states original music</label>
          <label><input type="checkbox" checked={Boolean(song.monetization_added_value)} onChange={(e) => setSong({ ...song, monetization_added_value: e.target.checked ? 1 : 0 })} /> Added value included</label>
          <button type="submit">{editingId ? 'Update Song' : 'Save Song'}</button>
          {editingId && <button type="button" onClick={() => { setSong(blankSong); setEditingId(null); }}>Cancel Edit</button>}
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
                  <button onClick={() => handleEdit(s)}>Edit</button>
                  <button onClick={() => generateUpload(s.id)}>Upload Plan</button>
                  <button className="danger" onClick={() => handleDelete(s.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h2>Genres</h2>
          <ul className="list compact">{genres.map((g) => <li key={g}><span>{g}</span><strong>{genreCounts[g] || 0}</strong></li>)}</ul>
          <h3>Radio Planner</h3>
          <div className="row">
            <button onClick={() => generateRadio('genre', 'Afrobeats', 1)}>1H Afrobeats</button>
            <button onClick={() => generateRadio('genre', 'Lofi', 3)}>3H Lofi</button>
            <button onClick={() => generateRadio('mood', 'Chill', 8)}>8H Chill</button>
            <button onClick={() => generateRadio('genre', 'EDM', 24)}>24H EDM</button>
          </div>

          <h3>Export</h3>
          <div className="row wrap">
            <a href={`${API}/export/songs`} target="_blank">Songs CSV</a>
            <a href={`${API}/export/albums`} target="_blank">Albums CSV</a>
            <a href={`${API}/export/upload_metadata`} target="_blank">YouTube Sheet</a>
            <a href={`${API}/export/radio_schedule`} target="_blank">Radio Schedule</a>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Album Builder</h2>
        <div className="row">
          <select value={albumDraft.focusType} onChange={(e) => setAlbumDraft({ ...albumDraft, focusType: e.target.value })}>
            <option value="genre">Genre</option>
            <option value="mood">Mood</option>
          </select>
          <input value={albumDraft.focusValue} onChange={(e) => setAlbumDraft({ ...albumDraft, focusValue: e.target.value })} placeholder="Afrobeats or Chill" />
          <input type="number" min="8" max="12" value={albumDraft.trackCount} onChange={(e) => setAlbumDraft({ ...albumDraft, trackCount: Number(e.target.value) })} />
          <button onClick={generateAlbum}>Generate Album</button>
          <button onClick={saveAlbum}>Save Album</button>
        </div>
        {!!albums.length && <p>Saved albums: {albums.length}</p>}
        {albumGenerated && <pre>{JSON.stringify(albumGenerated, null, 2)}</pre>}
      </section>

      {uploadPlan && <section className="panel"><h2>YouTube Upload Plan</h2><pre>{JSON.stringify(uploadPlan, null, 2)}</pre></section>}
      {radioPlan && <section className="panel"><h2>Radio Block</h2><pre>{JSON.stringify(radioPlan, null, 2)}</pre></section>}
    </div>
  );
}

function Metric({ title, value, risk }) {
  return <div className={`card ${risk ? 'danger' : ''}`}><p>{title}</p><h3>{value}</h3></div>;
}
