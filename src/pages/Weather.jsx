// src/pages/Weather.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function Weather() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  const search = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setError(''); setWeather(null); setLoading(true);
    try {
      const res = await api.get(`/weather/${city}`);
      setWeather(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const w = weather?.data;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span>☁️ Weather App {user && `— Hi, ${user.username}`}</span>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>Search Weather</h2>
        <form onSubmit={search} style={styles.form}>
          <input style={styles.input} value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Enter city name..." />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        {w && (
          <div style={styles.result}>
            <div style={styles.cityName}>{w.city}, {w.country}</div>
            <img
              src={`https://openweathermap.org/img/wn/${w.icon}@2x.png`}
              alt={w.description} />
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
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'linear-gradient(135deg,#667eea,#764ba2)', padding:'1rem' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', color:'white', padding:'0.5rem 1rem', marginBottom:'1rem' },
  logoutBtn: { background:'rgba(255,255,255,0.2)', color:'white', border:'1px solid rgba(255,255,255,0.4)', padding:'0.4rem 1rem', borderRadius:'6px', cursor:'pointer' },
  card: { background:'white', borderRadius:'16px', padding:'2rem', maxWidth:'420px', margin:'0 auto', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' },
  title: { textAlign:'center', marginBottom:'1.5rem', color:'#333' },
  form: { display:'flex', gap:'8px', marginBottom:'1rem' },
  input: { flex:1, padding:'0.75rem', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem' },
  btn: { padding:'0.75rem 1.25rem', background:'#667eea', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'1rem' },
  error: { color:'#ef4444', background:'#fef2f2', padding:'0.75rem', borderRadius:'8px' },
  result: { textAlign:'center', marginTop:'1rem' },
  cityName: { fontSize:'1.4rem', fontWeight:600, color:'#333' },
  temp: { fontSize:'3rem', fontWeight:700, color:'#667eea' },
  desc: { color:'#888', textTransform:'capitalize', marginBottom:'1rem' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginTop:'1rem' },
  stat: { background:'#f8f9fa', borderRadius:'8px', padding:'0.5rem', display:'flex', flexDirection:'column', fontSize:'0.85rem', color:'#666' },
  source: { marginTop:'0.75rem', fontSize:'0.8rem', color:'#aaa' }
};