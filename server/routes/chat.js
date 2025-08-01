const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Get user's rooms
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find({
      'members.user': req.user._id
    })
    .populate('members.user', 'username avatar status')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new room
router.post('/rooms', authenticateToken, async (req, res) => {
  try {
    const { name, description, type = 'public' } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const room = new Room({
      name: name.trim(),
      description: description || '',
      type,
      creator: req.user._id
    });

    // Add creator as admin member
    room.addMember(req.user._id, 'admin');

    await room.save();
    await room.populate('members.user', 'username avatar status');

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error during room creation' });
  }
});

// Join public room
router.post('/rooms/:roomId/join', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.type === 'private') {
      return res.status(403).json({ message: 'Cannot join private room without invitation' });
    }

    if (room.isMember(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this room' });
    }

    if (room.members.length >= room.settings.maxMembers) {
      return res.status(400).json({ message: 'Room is full' });
    }

    room.addMember(req.user._id);
    await room.save();
    await room.populate('members.user', 'username avatar status');

    res.json({
      message: 'Joined room successfully',
      room
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave room
router.post('/rooms/:roomId/leave', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isMember(req.user._id)) {
      return res.status(400).json({ message: 'Not a member of this room' });
    }

    room.removeMember(req.user._id);
    
    // If it's the last member and not the creator, delete the room
    if (room.members.length === 0) {
      await Room.findByIdAndDelete(roomId);
      return res.json({ message: 'Left room and room deleted' });
    }

    await room.save();

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room messages with pagination
router.get('/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50, before } = req.query;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view messages' });
    }

    const query = { 
      room: roomId,
      deleted: false
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username avatar')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username avatar'
        }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Mark messages as read
    const messagesToMarkRead = messages.filter(msg => 
      !msg.readBy.some(r => r.user.toString() === req.user._id.toString())
    );

    for (const message of messagesToMarkRead) {
      message.markAsRead(req.user._id);
      await message.save();
    }

    res.json({ 
      messages: messages.reverse(), // Reverse to show oldest first
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search messages
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, roomId, type, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Build search query
    const searchQuery = {
      deleted: false,
      $text: { $search: q }
    };

    // Filter by room if specified
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room || !room.isMember(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to search in this room' });
      }
      searchQuery.room = roomId;
    } else {
      // Only search in rooms user is a member of
      const userRooms = await Room.find({ 'members.user': req.user._id });
      searchQuery.room = { $in: userRooms.map(r => r._id) };
    }

    // Filter by message type if specified
    if (type) {
      searchQuery.type = type;
    }

    const messages = await Message.find(searchQuery)
      .populate('sender', 'username avatar')
      .populate('room', 'name type')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalResults = await Message.countDocuments(searchQuery);

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResults,
        pages: Math.ceil(totalResults / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// Get public rooms
router.get('/rooms/public', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = { type: 'public' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const rooms = await Room.find(query)
      .populate('creator', 'username')
      .select('name description memberCount lastActivity createdAt')
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalRooms = await Room.countDocuments(query);

    res.json({
      rooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalRooms,
        pages: Math.ceil(totalRooms / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get public rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room details
router.get('/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findById(roomId)
      .populate('members.user', 'username avatar status lastSeen')
      .populate('creator', 'username avatar');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isMember(req.user._id) && room.type === 'private') {
      return res.status(403).json({ message: 'Not authorized to view this room' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Get room details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update room settings (admin/moderator only)
router.put('/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, description, settings } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const userRole = room.getMemberRole(req.user._id);
    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return res.status(403).json({ message: 'Not authorized to update room settings' });
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (settings) updates.settings = { ...room.settings, ...settings };

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      updates,
      { new: true }
    ).populate('members.user', 'username avatar status');

    res.json({
      message: 'Room updated successfully',
      room: updatedRoom
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create text search index for messages
Message.collection.createIndex({ content: 'text' });

module.exports = router;