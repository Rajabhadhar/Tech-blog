import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login(formData);
      if (res.data.success) {
        // Save the JWT to local storage
        localStorage.setItem('adminToken', res.data.data.token);
        // CHANGED: Redirect to the Admin Dashboard (/admin) instead of /create
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#fff',
    marginTop: '0.4rem',
    marginBottom: '1rem'
  };

  return (
    <div className="container" style={{ maxWidth: '400px', padding: '5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <div style={{ background: 'var(--primary)', color: '#fff', padding: '0.75rem', borderRadius: '50%' }}>
          <Lock size={24} />
        </div>
      </div>
      
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Admin Login</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Sign in to access the Content Management System.
      </p>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          padding: '0.75rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Email Address</label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          style={inputStyle}
          placeholder="admin@techblog.com"
        />

        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Password</label>
        <input
          type="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
          style={inputStyle}
          placeholder="••••••••"
        />

        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;