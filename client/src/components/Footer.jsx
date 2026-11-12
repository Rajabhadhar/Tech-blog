import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--surface-color)',
      padding: '2.5rem 0',
      marginTop: '4rem',
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <p>© 2026 TechBlog. Built with React, Node.js, Express & MongoDB Atlas.</p>
        <p>Full-Stack MERN Architecture</p>
      </div>
    </footer>
  );
};

export default Footer;