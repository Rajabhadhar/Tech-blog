import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', position: 'relative', width: '100%', maxWidth: '400px' }}>
      <input
        type="text"
        placeholder="Search articles by title or keyword..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '0.6rem 1rem 0.6rem 2.5rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-color)',
          color: 'var(--text-main)',
          fontSize: '0.9rem',
          outline: 'none',
        }}
      />
      <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
    </form>
  );
};

export default SearchBar;