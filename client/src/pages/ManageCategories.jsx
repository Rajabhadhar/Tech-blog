import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/api';
import { ArrowLeft, Plus, Edit, Trash2, X, Save } from 'lucide-react';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null); // Tracks if we are creating or updating
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data.data);
    } catch (err) {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing category
        await categoryService.updateCategory(editingId, formData);
      } else {
        // Create new category
        await categoryService.createCategory(formData);
      }
      
      // Reset form and refresh list
      setFormData({ name: '', description: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category._id);
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        setCategories(categories.filter((cat) => cat._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '6px', 
    border: '1px solid var(--border-color)', marginBottom: '1rem',
    fontFamily: 'var(--font-sans)', fontSize: '0.95rem'
  };

  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' };

  return (
    <div className="container" style={{ maxWidth: '1200px', padding: '3rem 1.5rem' }}>
      <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to CMS Dashboard
      </Link>

      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Category Management</h1>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.85rem 1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Form Column */}
        <div style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingId ? <><Edit size={18} /> Edit Category</> : <><Plus size={18} /> Add New Category</>}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Category Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} style={inputStyle} placeholder="e.g. Architecture" />

            <label style={labelStyle}>Description</label>
            <textarea name="description" rows={3} value={formData.description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Brief description of this category..." />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" disabled={formLoading} className="btn" style={{ flex: 1, justifyContent: 'center' }}>
                <Save size={16} /> {formLoading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
              </button>
              
              {editingId && (
                <button type="button" onClick={handleCancelEdit} style={{ padding: '0.75rem 1rem', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <X size={16} /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Column */}
        <div style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Slug</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center' }}>No categories found.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{cat.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{cat.slug}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                      <button onClick={() => handleEdit(cat)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(cat._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
};

export default ManageCategories;