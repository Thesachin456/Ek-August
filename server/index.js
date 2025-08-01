const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/users');
const { connectDB } = require('./config/database');
const { authenticateSocket } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || "https://your-app.onrender.com"
    : "http://localhost:3000",
  credentials: true
};

const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// Socket.IO connection handling
const activeUsers = new Map();
const typingUsers = new Map();

io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Add user to active users
  activeUsers.set(socket.userId, {
    socketId: socket.id,
    userId: socket.userId,
    username: socket.username,
    avatar: socket.avatar,
    lastSeen: new Date()
  });

  // Broadcast updated user list
  io.emit('users:online', Array.from(activeUsers.values()));

  // Join user to their rooms
  socket.on('join:rooms', (rooms) => {
    rooms.forEach(roomId => {
      socket.join(roomId);
    });
  });

  // Handle new messages
  socket.on('message:send', async (data) => {
    try {
      const { roomId, content, type = 'text', replyTo } = data;
      
      // Save message to database
      const Message = require('./models/Message');
      const newMessage = new Message({
        sender: socket.userId,
        room: roomId,
        content,
        type,
        replyTo,
        timestamp: new Date()
      });
      
      await newMessage.save();
      await newMessage.populate('sender', 'username avatar');
      
      // Broadcast message to room
      io.to(roomId).emit('message:new', newMessage);
      
      // Stop typing indicator for this user
      const typingKey = `${roomId}:${socket.userId}`;
      if (typingUsers.has(typingKey)) {
        typingUsers.delete(typingKey);
        socket.to(roomId).emit('typing:stop', { 
          userId: socket.userId, 
          roomId 
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing:start', ({ roomId }) => {
    const typingKey = `${roomId}:${socket.userId}`;
    typingUsers.set(typingKey, {
      userId: socket.userId,
      username: socket.username,
      roomId,
      timestamp: Date.now()
    });
    
    socket.to(roomId).emit('typing:start', {
      userId: socket.userId,
      username: socket.username,
      roomId
    });
  });

  socket.on('typing:stop', ({ roomId }) => {
    const typingKey = `${roomId}:${socket.userId}`;
    typingUsers.delete(typingKey);
    
    socket.to(roomId).emit('typing:stop', {
      userId: socket.userId,
      roomId
    });
  });

  // Handle message reactions
  socket.on('message:react', async (data) => {
    try {
      const { messageId, emoji } = data;
      const Message = require('./models/Message');
      
      const message = await Message.findById(messageId);
      if (!message) return;
      
      const existingReaction = message.reactions.find(r => 
        r.user.toString() === socket.userId && r.emoji === emoji
      );
      
      if (existingReaction) {
        // Remove reaction
        message.reactions = message.reactions.filter(r => 
          !(r.user.toString() === socket.userId && r.emoji === emoji)
        );
      } else {
        // Add reaction
        message.reactions.push({
          user: socket.userId,
          emoji,
          timestamp: new Date()
        });
      }
      
      await message.save();
      
      io.to(message.room.toString()).emit('message:reaction', {
        messageId,
        reactions: message.reactions
      });
      
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  });

  // Handle file uploads
  socket.on('file:upload', async (data) => {
    try {
      const { roomId, fileName, fileType, fileSize, fileData } = data;
      
      // Here you would typically save the file to cloud storage
      // For now, we'll just broadcast the file info
      const Message = require('./models/Message');
      const newMessage = new Message({
        sender: socket.userId,
        room: roomId,
        content: fileName,
        type: 'file',
        fileInfo: {
          name: fileName,
          type: fileType,
          size: fileSize,
          url: fileData // In production, this would be a cloud storage URL
        },
        timestamp: new Date()
      });
      
      await newMessage.save();
      await newMessage.populate('sender', 'username avatar');
      
      io.to(roomId).emit('message:new', newMessage);
      
    } catch (error) {
      console.error('Error handling file upload:', error);
      socket.emit('error', { message: 'Failed to upload file' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    // Remove from active users
    activeUsers.delete(socket.userId);
    
    // Remove from typing users
    for (const [key, value] of typingUsers.entries()) {
      if (value.userId === socket.userId) {
        typingUsers.delete(key);
        socket.to(value.roomId).emit('typing:stop', {
          userId: socket.userId,
          roomId: value.roomId
        });
      }
    }
    
    // Broadcast updated user list
    io.emit('users:online', Array.from(activeUsers.values()));
  });
});

// Clean up typing indicators periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of typingUsers.entries()) {
    if (now - value.timestamp > 10000) { // 10 seconds timeout
      typingUsers.delete(key);
      io.to(value.roomId).emit('typing:stop', {
        userId: value.userId,
        roomId: value.roomId
      });
    }
  }
}, 5000);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});