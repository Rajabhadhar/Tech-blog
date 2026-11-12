import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/api';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';

const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await postService.getAdminPosts();
      setPosts(res.data.data);
    } catch (err) {
      setError('Failed to load admin posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(id);
        setPosts(posts.filter(post => post._id !== id));
      } catch (err) {
        alert('Failed to delete post');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published': return <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Published</span>;
      case 'draft': return <span style={{ background: '#f3f4f6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Draft</span>;
      case 'scheduled': return <span style={{ background: '#fef9c3', color: '#854d0e', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Scheduled</span>;
      default: return null;
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1100px', padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>CMS Dashboard</h1>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            to="/categories/manage" 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
          >
            Manage Categories
          </Link>
          
          <Link to="/create" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> New Post
          </Link>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Article Title</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading posts...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No posts found. Create one!</td></tr>
            ) : (
              posts.map((post) => (
                <tr key={post._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{post.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{post.category?.name || 'Uncategorized'}</td>
                  <td style={{ padding: '1rem' }}>{getStatusBadge(post.status)}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  
                  {/* UPDATED ACTIONS COLUMN: Added explicit text labels so you can't miss them */}
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                    <Link to={`/posts/${post.slug}`} target="_blank" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Eye size={18} /> View
                    </Link>
                    <Link to={`/edit/${post._id}`} style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
                      <Edit size={18} /> Edit
                    </Link>
                    <button onClick={() => handleDelete(post._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Trash2 size={18} /> Delete
                    </button>
                  </td>
                  
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;