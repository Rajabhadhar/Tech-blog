import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, LogOut, Lock } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--surface-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 120px', // Fixed side column widths keep the center logo locked in place!
          alignItems: 'center',
          height: '76px',
        }}
      >
        {/* LEFT SIDE: Always show Articles link to keep layout balanced */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.95rem', textDecoration: 'none' }}>
            Articles
          </Link>
        </div>

        {/* CENTER: Logo locked in dead center */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              padding: '0',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              textDecoration: 'none',
              width: '150px',
              height: '40px',
            }}
          >
            <img 
              src="/logo.png" 
              alt="TechBlog Logo" 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block' 
              }} 
            />
          </Link>
        </div>

        {/* RIGHT SIDE: Admin / Dashboard / Logout Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', fontWeight: 500, fontSize: '0.95rem' }}>
          {token ? (
            <>
              <Link
                to="/admin"
                className="btn"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#ef4444', 
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.3rem', 
                color: 'var(--text-main)',
                textDecoration: 'none'
              }}
            >
              <Lock size={15} /> Admin
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;