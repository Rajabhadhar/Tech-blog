import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { categoryService, postService, uploadService } from '../services/api';
import { ArrowLeft, Send, UploadCloud, Settings } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    coverImage: '',
    tags: '',
    featured: false,
    status: 'draft',
    publishedAt: '',
    seoTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.data.success) {
          setCategories(res.data.data);
          if (res.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, category: res.data.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploadingImage(true);
    setError(null);
    try {
      const res = await uploadService.uploadImage(uploadData);
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, coverImage: res.data.data }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        coverImage: formData.coverImage.trim() || undefined,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        publishedAt: formData.status === 'scheduled' ? formData.publishedAt : new Date(),
      };

      const res = await postService.createPost(payload);
      if (res.data.success) {
        navigate(`/posts/${res.data.data.slug}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  // SMART IMAGE HANDLER for preview
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const quillModules = {
    toolbar: [
      [{ header: [2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: 'var(--surface-color)',
    color: 'var(--text-main)',
    marginBottom: '1.25rem',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: '0.4rem',
  };

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '3rem 1.5rem' }}>
      <Link
        to="/admin"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>Write New Article</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Configure SEO, set publishing schedules, and format content below.
      </p>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.85rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* 1. Article Title */}
        <div>
          <label style={labelStyle}>Article Title *</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange} style={inputStyle} />
        </div>

        {/* 2. Short Summary */}
        <div>
          <label style={labelStyle}>Short Summary *</label>
          <textarea name="summary" required rows={3} maxLength={300} value={formData.summary} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {/* 3. Category */}
        <div>
          <label style={labelStyle}>Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* 4. Cover Image */}
        <div>
          <label style={labelStyle}>Cover Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={inputStyle} />
          {uploadingImage && <div style={{ color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '1rem' }}><UploadCloud size={16} /> Uploading image...</div>}
          {formData.coverImage && !uploadingImage && (
            <div style={{ marginBottom: '1.25rem' }}>
              <img src={getImageUrl(formData.coverImage)} alt="Cover Preview" style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          )}
        </div>

        {/* 5. Tags */}
        <div>
          <label style={labelStyle}>Tags (comma separated)</label>
          <input type="text" name="tags" placeholder="React, Node, API" value={formData.tags} onChange={handleChange} style={inputStyle} />
        </div>

        {/* 6. Article Content (Rich Text Editor) */}
        <div>
          <label style={labelStyle}>Article Content *</label>
          <div style={{ backgroundColor: '#fff', marginBottom: '3rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <ReactQuill 
              theme="snow" 
              value={formData.content} 
              onChange={handleContentChange} 
              modules={quillModules}
              style={{ height: '350px', marginBottom: '2.5rem' }} 
            />
          </div>
        </div>

        {/* 7. Publishing Settings */}
        <div style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <Settings size={18} /> Publishing Settings
          </h3>
          
          <div>
            <label style={labelStyle}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
              <option value="draft">Save as Draft</option>
              <option value="published">Publish Immediately</option>
              <option value="scheduled">Schedule for Later</option>
            </select>
          </div>

          {formData.status === 'scheduled' && (
            <div>
              <label style={labelStyle}>Schedule Date & Time</label>
              <input type="datetime-local" name="publishedAt" required value={formData.publishedAt} onChange={handleChange} style={inputStyle} />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <label htmlFor="featured" style={{ fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>Featured Article</label>
          </div>
        </div>

        {/* 8. SEO Settings */}
        <div style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>SEO Settings</h3>
          
          <div>
            <label style={labelStyle}>SEO Title (Max 60 chars)</label>
            <input type="text" name="seoTitle" maxLength={60} value={formData.seoTitle} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Meta Description (Max 160 chars)</label>
            <textarea name="metaDescription" rows={2} maxLength={160} value={formData.metaDescription} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        {/* FINAL PUBLISH / SAVE BUTTON AT THE VERY BOTTOM */}
        <div style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
          <button 
            type="submit" 
            disabled={loading || uploadingImage} 
            className="btn" 
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', justifyContent: 'center', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <Send size={18} />
            {loading ? 'Saving...' : (formData.status === 'draft' ? 'Save Draft' : 'Publish Post')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreatePost;