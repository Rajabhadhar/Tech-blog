import express from 'express';
import {
  getPosts,
  getFeaturedPosts,
  getPostBySlug,
  createPost,
  deletePost,
  getAdminPosts,
  updatePost,
  getPostById
} from '../controllers/postController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/', getPosts);
router.get('/featured', getFeaturedPosts);

// ==========================================
// PROTECTED ADMIN ROUTES (Requires Token)
// ==========================================
// Note: These must go before /:slug
router.get('/admin', protect, getAdminPosts);
router.get('/admin/:id', protect, getPostById);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// ==========================================
// PUBLIC DYNAMIC ROUTES (Must go last!)
// ==========================================
router.get('/:slug', getPostBySlug);

export default router;