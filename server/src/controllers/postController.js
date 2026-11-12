import Post from '../models/Post.js';
import Category from '../models/Category.js';

// @desc    Get all posts (with pagination & category filter)
// @route   GET /api/v1/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;

    const query = { status: 'published' };

    // Filter by category slug if provided
    if (req.query.category) {
      const categoryDoc = await Category.findOne({ slug: req.query.category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          pagination: { page, limit, totalPages: 0 },
          data: [],
        });
      }
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching posts',
    });
  }
};

// @desc    Get featured posts for hero section
// @route   GET /api/v1/posts/featured
// @access  Public
export const getFeaturedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ featured: true, status: 'published' })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching featured posts',
    });
  }
};

// @desc    Get single post by slug and increment views
// @route   GET /api/v1/posts/:slug
// @access  Public
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOneAndUpdate(
      { slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('category', 'name slug');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post not found with slug: ${slug}`,
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching post',
    });
  }
};

// @desc    Create new post
// @route   POST /api/v1/posts
// @access  Public
export const createPost = async (req, res) => {
  try {
    const { 
      title, summary, content, category, coverImage, 
      tags, featured, status, publishedAt, seoTitle, metaDescription // <-- Added new fields
    } = req.body;

    if (!title || !summary || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, summary, content, and category ID',
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Referenced category does not exist',
      });
    }

    const post = await Post.create({
      title,
      summary,
      content,
      category,
      coverImage,
      tags: Array.isArray(tags) ? tags : [],
      featured: Boolean(featured),
      status: status || 'draft',
      publishedAt: publishedAt || Date.now(), // <-- Added
      seoTitle, // <-- Added
      metaDescription // <-- Added
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating post',
    });
  }
};

// @desc    Delete post by ID
// @route   DELETE /api/v1/posts/:id
// @access  Public
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting post',
    });
  }
};

// @desc    Get all posts for Admin Dashboard (includes drafts & scheduled)
// @route   GET /api/v1/posts/admin
// @access  Private/Admin
export const getAdminPosts = async (req, res, next) => {
  try {
    // Fetch all posts regardless of status, populate category name
    const posts = await Post.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/v1/posts/:id
// @access  Private/Admin
export const updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Update the post with the new data
    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating post',
    });
  }
};

// @desc    Get single post by ID (for Admin Edit)
// @route   GET /api/v1/posts/admin/:id
// @access  Private/Admin
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};
