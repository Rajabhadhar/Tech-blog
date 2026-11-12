import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token from the header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the admin by the ID stored inside the token
      // .select('-password') ensures the password hash is NOT attached to the request object
      req.admin = await Admin.findById(decoded.id).select('-password');

      // The token is valid and the admin exists, proceed to the actual controller logic
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  // If no token was found in the headers at all
  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};