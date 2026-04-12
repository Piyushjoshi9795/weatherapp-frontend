// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.username, form.email, form.password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const styles = {
    container: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0f4f8' },
    card: { background:'white', padding:'2rem', borderRadius:'12px', width:'340px', boxShadow:'0 4px 24px rgba(0,0,0,0.1)' },
    input: { display:'block', width:'100%', padding:'0.75rem', margin:'0.5rem 0', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem', boxSizing:'border-box' },
    btn: { width:'100%', padding:'0.75rem', marginTop:'1rem', background:'#10b981', color:'white', border:'none', borderRadius:'8px', fontSize:'1rem', cursor:'pointer' },
    error: { color:'#ef4444', background:'#fef2f2', padding:'0.5rem', borderRadius:'6px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign:'center' }}>☁️ Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {['username','email','password'].map(field => (
            <input key={field} style={styles.input}
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={e => setForm({...form, [field]: e.target.value})}
              required />
          ))}
          <button style={styles.btn} type="submit">Register</button>
        </form>
        <p style={{ textAlign:'center', marginTop:'1rem' }}>Have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}