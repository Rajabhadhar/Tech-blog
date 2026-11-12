import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Interceptor: Automatically attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const postService = {
  getPosts: (page = 1, limit = 6, category = '') => {
    let url = `/posts?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    return api.get(url);
  },
  getFeaturedPosts: () => api.get('/posts/featured'),
  getPostBySlug: (slug) => api.get(`/posts/${slug}`),
  createPost: (postData) => api.post('/posts', postData),
  getAdminPosts: () => api.get('/posts/admin'),
  getPostById: (id) => api.get(`/posts/admin/${id}`),
  deletePost: (id) => api.delete(`/posts/${id}`),
  updatePost: (id, data) => api.put(`/posts/${id}`, data), // <-- Add this
  searchPosts: (keyword) => api.get(`/posts/search?keyword=${keyword}`),
// OR if your backend uses query parameters on the main posts route:
// getPosts: (page, limit, category, search) => api.get(`/posts?page=${page}&limit=${limit}&category=${category}&search=${search}`)
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  // NEW: Admin methods
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const uploadService = {
  uploadImage: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};


export default api;