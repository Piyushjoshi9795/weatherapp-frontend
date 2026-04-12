// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/weather');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>☁️ Weather App</h2>
        <h3 style={styles.sub}>Sign in</h3>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.link}>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0f4f8' },
  card: { background:'white', padding:'2rem', borderRadius:'12px', width:'340px', boxShadow:'0 4px 24px rgba(0,0,0,0.1)' },
  title: { textAlign:'center', fontSize:'1.8rem', marginBottom:'0.25rem' },
  sub: { textAlign:'center', fontWeight:400, color:'#666', marginBottom:'1.5rem' },
  input: { display:'block', width:'100%', padding:'0.75rem', margin:'0.5rem 0', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem', boxSizing:'border-box' },
  btn: { width:'100%', padding:'0.75rem', marginTop:'1rem', background:'#3b82f6', color:'white', border:'none', borderRadius:'8px', fontSize:'1rem', cursor:'pointer' },
  error: { color:'#ef4444', background:'#fef2f2', padding:'0.5rem', borderRadius:'6px', marginBottom:'1rem' },
  link: { textAlign:'center', marginTop:'1rem', fontSize:'0.9rem' }
};