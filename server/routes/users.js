const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = {
      $and: [
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } }, // Exclude current user
        { _id: { $nin: req.user.blockedUsers } } // Exclude blocked users
      ]
    };

    const users = await User.find(searchQuery)
      .select('username email avatar status lastSeen bio')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalUsers = await User.countDocuments(searchQuery);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('username email avatar status lastSeen bio privacy createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current user is blocked
    if (user.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Filter response based on privacy settings
    const profile = {
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt
    };

    // Add status based on privacy settings
    if (user.privacy.showOnlineStatus) {
      profile.status = user.status;
    }

    // Add last seen based on privacy settings
    if (user.privacy.showLastSeen && user.status === 'offline') {
      profile.lastSeen = user.lastSeen;
    }

    // Check friendship status
    const currentUser = await User.findById(req.user._id);
    const friendship = currentUser.friends.find(f => 
      f.user.toString() === userId
    );
    
    if (friendship) {
      profile.friendshipStatus = friendship.status;
    }

    res.json({ user: profile });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send friend request
router.post('/:userId/friend-request', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current user is blocked
    if (targetUser.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Cannot send friend request to this user' });
    }

    const currentUser = req.user;

    // Check if friendship already exists
    const existingFriendship = currentUser.friends.find(f => 
      f.user.toString() === userId
    );

    if (existingFriendship) {
      return res.status(400).json({ 
        message: `Friend request already ${existingFriendship.status}` 
      });
    }

    // Add friendship for current user
    currentUser.friends.push({
      user: userId,
      status: 'pending'
    });

    // Add friendship for target user
    targetUser.friends.push({
      user: currentUser._id,
      status: 'pending'
    });

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept/reject friend request
router.put('/:userId/friend-request', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use accept or reject' });
    }

    const currentUser = req.user;
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the friendship
    const currentUserFriendship = currentUser.friends.find(f => 
      f.user.toString() === userId && f.status === 'pending'
    );

    const targetUserFriendship = targetUser.friends.find(f => 
      f.user.toString() === currentUser._id.toString() && f.status === 'pending'
    );

    if (!currentUserFriendship || !targetUserFriendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (action === 'accept') {
      currentUserFriendship.status = 'accepted';
      targetUserFriendship.status = 'accepted';
    } else {
      // Remove the friendship entries for rejection
      currentUser.friends = currentUser.friends.filter(f => 
        f.user.toString() !== userId
      );
      targetUser.friends = targetUser.friends.filter(f => 
        f.user.toString() !== currentUser._id.toString()
      );
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ 
      message: `Friend request ${action}ed successfully` 
    });
  } catch (error) {
    console.error('Accept/reject friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove friend
router.delete('/:userId/friend', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const currentUser = req.user;
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove friendship from both users
    currentUser.friends = currentUser.friends.filter(f => 
      f.user.toString() !== userId
    );

    targetUser.friends = targetUser.friends.filter(f => 
      f.user.toString() !== currentUser._id.toString()
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's friends
router.get('/me/friends', authenticateToken, async (req, res) => {
  try {
    const { status = 'accepted' } = req.query;
    
    const user = await User.findById(req.user._id)
      .populate({
        path: 'friends.user',
        select: 'username avatar status lastSeen'
      });

    const friends = user.friends
      .filter(f => f.status === status)
      .map(f => ({
        ...f.user.toObject(),
        friendshipDate: f.createdAt
      }));

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get online users
router.get('/online', authenticateToken, async (req, res) => {
  try {
    const onlineUsers = await User.find({
      status: 'online',
      _id: { $ne: req.user._id },
      'privacy.showOnlineStatus': true,
      _id: { $nin: req.user.blockedUsers }
    })
    .select('username avatar status')
    .limit(50);

    res.json({ users: onlineUsers });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;