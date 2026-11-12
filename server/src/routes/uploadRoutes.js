import express from 'express';
import { upload } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @route   POST /api/v1/upload
// @access  Private/Admin
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image provided' });
  }
  
  // Format the path for web URLs (replaces Windows backslashes with forward slashes)
  const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
  
  res.json({
    success: true,
    data: imagePath,
  });
});

export default router;