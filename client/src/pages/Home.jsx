import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService, categoryService } from '../services/api';
import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch Categories, Featured, and Trending Posts on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, featRes, trendRes] = await Promise.all([
          categoryService.getCategories(),
          postService.getFeaturedPosts(),
          postService.getTrendingPosts ? postService.getTrendingPosts() : postService.getPosts(1, 5), // fallback if trending endpoint varies
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (featRes.data.success) setFeaturedPosts(featRes.data.data);
        if (trendRes.data.success) {
          // Sort by views descending for trending
          const sortedTrending = trendRes.data.data.sort((a, b) => b.views - a.views).slice(0, 4);
          setTrendingPosts(sortedTrending);
        }
      } catch (err) {
        console.error('Failed to load initial metadata', err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Paginated Posts when page, category, or search query changes
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Pass search query if your backend supports it, or filter client-side
        const res = await postService.getPosts(page, 6, selectedCategory);
        if (res.data.success) {
          let fetchedPosts = res.data.data;
          
          // Apply client-side search filtering if search query exists
          if (searchQuery.trim() !== '') {
            fetchedPosts = fetchedPosts.filter(post => 
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.summary.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }

          setPosts(fetchedPosts);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page, selectedCategory, searchQuery]);

  const handleCategoryClick = (slug) => {
    setSelectedCategory(slug);
    setSearchQuery(''); // reset search when switching categories
    setPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedCategory(''); // reset category filter during search
    setPage(1);
  };

  // SMART IMAGE HANDLER
  const getImageUrl = (path) => {
    if (!path) return '/default-placeholder.jpg';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const heroPost = featuredPosts[0];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Featured Hero Banner */}
      {heroPost && !selectedCategory && !searchQuery && (
        <section style={{
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        }}>
          <img
            src={getImageUrl(heroPost.coverImage)}
            alt={heroPost.title}
            style={{ width: '100%', height: '100%', minHeight: '280px', objectFit: 'cover' }}
          />
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>
              <Sparkles size={16} /> Featured Engineering Post
            </span>
            <h1 style={{ fontSize: '1.85rem', lineHeight: 1.3, marginBottom: '1rem' }}>
              <Link to={`/posts/${heroPost.slug}`}>{heroPost.title}</Link>
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {heroPost.summary}
            </p>
            <Link to={`/posts/${heroPost.slug}`} className="btn" style={{ alignSelf: 'flex-start' }}>
              Read Full Article <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Filters & Search Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleCategoryClick('')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              backgroundColor: selectedCategory === '' && !searchQuery ? 'var(--primary)' : 'var(--surface-color)',
              color: selectedCategory === '' && !searchQuery ? '#fff' : 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem',
            }}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat.slug)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                backgroundColor: selectedCategory === cat.slug ? 'var(--primary)' : 'var(--surface-color)',
                color: selectedCategory === cat.slug ? '#fff' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.85rem',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Bar Component */}
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Main Layout Grid (Articles + Trending Sidebar) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Articles */}
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700 }}>
            {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory ? 'Filtered Articles' : 'Latest Articles'}
          </h2>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading articles...</p>
          ) : posts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>No articles found.</p>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && !searchQuery && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="btn"
                style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', margin: '0 0.5rem', color: 'var(--text-muted)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="btn"
                style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Trending / Popular Articles Sidebar */}
        <aside style={{
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          position: 'sticky',
          top: '90px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
            <TrendingUp size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Trending Posts</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {trendingPosts.map((post, index) => (
              <div key={post._id} style={{ paddingBottom: '1rem', borderBottom: index < trendingPosts.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>0{index + 1}</span>
                <h4 style={{ fontSize: '0.95rem', lineHeight: 1.4, margin: '0.2rem 0' }}>
                  <Link to={`/posts/${post.slug}`} style={{ color: 'var(--text-main)' }}>
                    {post.title}
                  </Link>
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{post.views} views</span>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Home;