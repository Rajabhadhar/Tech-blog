import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Calendar } from 'lucide-react';

const PostCard = ({ post }) => {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // SMART IMAGE HANDLER: Checks if the URL is already absolute
  const getImageUrl = (path) => {
    if (!path) return '/default-placeholder.jpg';
    if (path.startsWith('http')) return path; // Leaves external links alone
    return `http://localhost:5000${path}`; // Adds backend URL to uploads
  };

  return (
    <article style={{
      backgroundColor: 'var(--surface-color)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}>
      <Link to={`/posts/${post.slug}`}>
        <img
          src={getImageUrl(post.coverImage)}
          alt={post.title}
          style={{ width: '100%', height: '190px', objectFit: 'cover' }}
        />
      </Link>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {post.category && (
          <span style={{
            alignSelf: 'flex-start',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--tag-text)',
            backgroundColor: 'var(--tag-bg)',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            marginBottom: '0.75rem',
          }}>
            {post.category.name}
          </span>
        )}

        <h3 style={{ fontSize: '1.15rem', lineHeight: 1.4, marginBottom: '0.5rem' }}>
          <Link to={`/posts/${post.slug}`} style={{ color: 'var(--text-main)' }}>
            {post.title}
          </Link>
        </h3>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          marginBottom: '1rem',
          flexGrow: 1,
        }}>
          {post.summary}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={14} />
            {formattedDate}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} />
              {post.readTime} min read
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Eye size={14} />
              {post.views}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;