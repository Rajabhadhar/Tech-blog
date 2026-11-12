import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Helper function to generate a JWT
const generateToken = (id) => {
  // Signs the token with the Admin's ID and your secret key, expiring in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth admin & get token (Login)
// @route   POST /api/v1/auth/login
// @access  Public
export const authAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the admin by email
    const admin = await Admin.findOne({ email });

    // 2. Check if admin exists AND if the password matches the hash
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};

// @desc    Register a new admin (Temporary route for setup)
// @route   POST /api/v1/auth/register
// @access  Public (Remove or secure this after creating your first admin!)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    // Create the admin (the pre-save hook in Admin.js will hash the password)
    const admin = await Admin.create({
      name,
      email,
      password,
    });

    if (admin) {
      res.status(201).json({
        success: true,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};