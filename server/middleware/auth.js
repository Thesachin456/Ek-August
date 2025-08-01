const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'ek-august-chat-secret-key';

// Middleware for HTTP routes
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware for Socket.IO
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user info to socket
    socket.userId = user._id.toString();
    socket.username = user.username;
    socket.avatar = user.avatar;
    socket.user = user;
    
    // Update user status to online
    await User.findByIdAndUpdate(user._id, { 
      status: 'online',
      lastSeen: new Date()
    });
    
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
  authenticateToken,
  authenticateSocket,
  generateToken
};