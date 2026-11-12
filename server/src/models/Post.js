import mongoose from 'mongoose';
import slugify from 'slugify';
import sanitizeHtml from 'sanitize-html';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      unique: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    summary: {
      type: String,
      required: [true, 'Post summary is required'],
      trim: true,
      maxlength: [300, 'Summary cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true,
    },
    // NEW: Author Management
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming you create a User model for authors/admins
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    readTime: {
      type: Number,
      default: 1,
    },
    // UPDATED: Added 'scheduled' to enum for future publishing
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled'],
      default: 'draft', // Defaulting to draft is safer for a CMS
      index: true,
    },
    // NEW: Scheduling
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    // NEW: SEO Configuration
    seoTitle: {
      type: String,
      maxlength: [60, 'SEO Title should be under 60 characters'],
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description should be under 160 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save lifecycle hook (Kept exactly as you wrote it)
postSchema.pre('save', function () {
  // 1. Auto-generate slug
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  // 2. Sanitize HTML content to prevent stored XSS
  if (this.isModified('content')) {
    this.content = sanitizeHtml(this.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'pre', 'code']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'width', 'height'],
        code: ['class'],
      },
    });

    // 3. Estimate read time (words / 200 WPM)
    const plainText = this.content.replace(/<[^>]*>?/gm, '');
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
});
const Post = mongoose.model('Post', postSchema);

export default Post;