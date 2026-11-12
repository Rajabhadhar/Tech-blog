import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../services/api';
import { ArrowLeft, Clock, Eye, Calendar, Tag, Share2, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [prevNext, setPrevNext] = useState({ prev: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticleData = async () => {
      setLoading(true);
      try {
        // Fetch current post
        const res = await postService.getPostBySlug(slug);
        if (res.data.success) {
          const currentPost = res.data.data;
          setPost(currentPost);

          // Fetch all posts to determine related articles and prev/next navigation
          const allPostsRes = await postService.getPosts(1, 50);
          if (allPostsRes.data.success) {
            const allPosts = allPostsRes.data.data;

            // 1. Find Related Posts (same category, excluding current)
            if (currentPost.category) {
              const related = allPosts
                .filter(p => p.category?._id === currentPost.category._id && p._id !== currentPost._id)
                .slice(0, 3);
              setRelatedPosts(related);
            }

            // 2. Find Previous and Next Posts based on chronological order
            const currentIndex = allPosts.findIndex(p => p._id === currentPost._id);
            if (currentIndex !== -1) {
              setPrevNext({
                prev: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
                next: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
              });
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Article could not be found');
      } finally {
        setLoading(false);
        window.scrollTo(0, 0); // Scroll to top when slug changes
      }
    };

    fetchArticleData();
  }, [slug]);

  // SMART IMAGE HANDLER
  const getImageUrl = (path) => {
    if (!path) return '/default-placeholder.jpg';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Article Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/" className="btn"><ArrowLeft size={16} /> Back to Articles</Link>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="container" style={{ maxWidth: '840px', padding: '3rem 1.5rem' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to all articles
      </Link>

      {post.category && (
        <div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--tag-text)',
            backgroundColor: 'var(--tag-bg)',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
          }}>
            {post.category.name}
          </span>
        </div>
      )}

      <h1 style={{ fontSize: '2.4rem', lineHeight: 1.25, margin: '1rem 0' }}>
        {post.title}
      </h1>

      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={15} /> {formattedDate}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={15} /> {post.readTime} min read
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Eye size={15} /> {post.views} views
        </span>
      </div>

      {post.coverImage && (
        <img
          src={getImageUrl(post.coverImage)}
          alt={post.title}
          style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '8px', marginBottom: '2.5rem' }}
        />
      )}

      {/* Main Content */}
      <div
        style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-main)' }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags & Social Sharing Toolbar */}
      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Tags */}
        {post.tags && post.tags.length > 0 ? (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Tag size={16} color="var(--text-muted)" />
            {post.tags.map((tag, idx) => (
              <span key={idx} style={{ fontSize: '0.8rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
                #{tag}
              </span>
            ))}
          </div>
        ) : <div />}

        {/* Social Share Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.5rem' }}>
            <Share2 size={15} /> Share:
          </span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', backgroundColor: '#0ea5e9', color: '#fff', border: 'none' }}
          >
            Twitter
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
          >
            LinkedIn
          </a>
          <button
            onClick={handleCopyLink}
            className="btn"
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {copied ? <Check size={14} color="#16a34a" /> : null}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Previous / Next Article Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '3rem 0', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div>
          {prevNext.prev && (
            <Link to={`/posts/${prevNext.prev.slug}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', textDecoration: 'none' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <ChevronLeft size={14} /> Previous Article
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{prevNext.prev.title}</span>
            </Link>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          {prevNext.next && (
            <Link to={`/posts/${prevNext.next.slug}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', textDecoration: 'none' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Next Article <ChevronRight size={14} />
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{prevNext.next.title}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '2px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700 }}>Related Articles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {relatedPosts.map(rel => (
              <div key={rel._id} style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/posts/${rel.slug}`}>
                  <img src={getImageUrl(rel.coverImage)} alt={rel.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                </Link>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h4 style={{ fontSize: '1rem', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                    <Link to={`/posts/${rel.slug}`} style={{ color: 'var(--text-main)' }}>{rel.title}</Link>
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto' }}>{rel.readTime} min read</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default PostDetail;