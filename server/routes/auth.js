const express = require('express');
const multer = require('multer');
const { authenticateToken, generateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update status and last seen
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({ user: req.user.getPublicProfile() });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, bio, privacy, notifications } = req.body;
    const updates = {};

    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      updates.username = username;
    }

    if (bio !== undefined) updates.bio = bio;
    if (privacy) updates.privacy = { ...req.user.privacy, ...privacy };
    if (notifications) updates.notifications = { ...req.user.notifications, ...notifications };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Convert to base64 (in production, you'd upload to cloud storage)
    const avatarData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarData },
      { new: true }
    );

    res.json({
      message: 'Avatar updated successfully',
      avatar: updatedUser.avatar
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error during avatar upload' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Update user status to offline
    await User.findByIdAndUpdate(req.user._id, {
      status: 'offline',
      lastSeen: new Date()
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Block/unblock user
router.post('/block/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    if (userId === currentUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isBlocked = currentUser.blockedUsers.includes(userId);

    if (isBlocked) {
      // Unblock user
      currentUser.blockedUsers = currentUser.blockedUsers.filter(
        id => id.toString() !== userId
      );
    } else {
      // Block user
      currentUser.blockedUsers.push(userId);
    }

    await currentUser.save();

    res.json({
      message: isBlocked ? 'User unblocked' : 'User blocked',
      blocked: !isBlocked
    });

  } catch (error) {
    console.error('Block/unblock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;