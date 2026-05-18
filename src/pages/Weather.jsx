// src/pages/Weather.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

// ── Custom debounce hook ──────────────────────────────────
// value = the thing to debounce (search input)
// delay = how long to wait after last change (ms)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer every time 'value' changes
    const timer = setTimeout(() => {
      setDebouncedValue(value); // only update after delay ms of silence
    }, delay);

    // Cleanup: cancel the previous timer if value changes again
    // This is what makes debouncing work — we keep cancelling
    // until the user actually stops typing
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function Weather() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedCity, setSavedCity] = useState('');
  const { user, logout } = useAuth();

  // Debounce the city input — wait 500ms after user stops typing
  const debouncedCity = useDebounce(city, 500);

  // Auto-search when debounced value changes
  // (only if at least 2 characters — avoid searching "L" or "Lo")
  useEffect(() => {
    if (debouncedCity.trim().length >= 2) {
      fetchWeather(debouncedCity);
    }
  }, [debouncedCity]);

  const fetchWeather = async (cityName) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/weather/${cityName}`);
      setWeather(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'City not found');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Save city for daily digest
  const handleSaveCity = async () => {
    if (!weather?.data?.city) return;
    try {
      await api.post('/user/city', { city: weather.data.city });
      setSavedCity(weather.data.city);
      alert(`Daily digest enabled for ${weather.data.city}!`);
    } catch {
      alert('Failed to save city.');
    }
  };

  const w = weather?.data;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={{ color: 'white', fontWeight: 500 }}>
          ☁️ Weather App {user && `— Hi, ${user.username}`}
        </span>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>Search Weather</h2>

        {/* Search input — debounced auto-search */}
        <div style={styles.searchRow}>
          <input
            style={styles.input}
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Type a city... (auto-searches)"
          />
          {loading && <span style={styles.spinner}>⏳</span>}
        </div>

        {/* Debounce status indicator */}
        {city.length >= 2 && city !== debouncedCity && (
          <p style={styles.hint}>⌛ Waiting for you to stop typing...</p>
        )}
        {city === debouncedCity && debouncedCity.length >= 2 && (
          <p style={styles.hint}>🔍 Searching for "{debouncedCity}"...</p>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {w && (
          <div style={styles.result}>
            <div style={styles.cityName}>{w.city}, {w.country}</div>
            <img src={`https://openweathermap.org/img/wn/${w.icon}@2x.png`} alt={w.description} />
            <div style={styles.temp}>{Math.round(w.temperature)}°C</div>
            <div style={styles.desc}>{w.description}</div>
            <div style={styles.grid}>
              <div style={styles.stat}><span>Feels like</span><strong>{Math.round(w.feelsLike)}°C</strong></div>
              <div style={styles.stat}><span>Humidity</span><strong>{w.humidity}%</strong></div>
              <div style={styles.stat}><span>Wind</span><strong>{w.windSpeed} m/s</strong></div>
            </div>
            <div style={styles.source}>
              {weather.source === 'cache' ? '⚡ Cached response' : '🌐 Live from API'}
            </div>

            {/* Save city for daily digest */}
            <button onClick={handleSaveCity} style={styles.digestBtn}>
              {savedCity === w.city
                ? `✅ Digest active for ${w.city}`
                : `📧 Get daily digest for ${w.city}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'linear-gradient(135deg,#667eea,#764ba2)', padding:'1rem' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 1rem', marginBottom:'1rem' },
  logoutBtn: { background:'rgba(255,255,255,0.2)', color:'white', border:'1px solid rgba(255,255,255,0.4)', padding:'0.4rem 1rem', borderRadius:'6px', cursor:'pointer' },
  card: { background:'white', borderRadius:'16px', padding:'2rem', maxWidth:'420px', margin:'0 auto', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' },
  title: { textAlign:'center', marginBottom:'1.5rem', color:'#333' },
  searchRow: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'0.5rem' },
  input: { flex:1, padding:'0.75rem', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem' },
  spinner: { fontSize:'1.2rem' },
  hint: { fontSize:'0.8rem', color:'#94a3b8', marginBottom:'0.5rem' },
  error: { color:'#ef4444', background:'#fef2f2', padding:'0.75rem', borderRadius:'8px' },
  result: { textAlign:'center', marginTop:'1rem' },
  cityName: { fontSize:'1.4rem', fontWeight:600, color:'#333' },
  temp: { fontSize:'3rem', fontWeight:700, color:'#667eea' },
  desc: { color:'#888', textTransform:'capitalize', marginBottom:'1rem' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginTop:'1rem' },
  stat: { background:'#f8f9fa', borderRadius:'8px', padding:'0.5rem', display:'flex', flexDirection:'column', fontSize:'0.85rem', color:'#666' },
  source: { marginTop:'0.75rem', fontSize:'0.8rem', color:'#aaa' },
  digestBtn: { marginTop:'1rem', width:'100%', padding:'0.6rem', background:'#f0f9ff', color:'#0369a1', border:'1px solid #bae6fd', borderRadius:'8px', cursor:'pointer', fontSize:'0.9rem' }
};