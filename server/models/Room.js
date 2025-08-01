const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  type: {
    type: String,
    enum: ['public', 'private', 'direct'],
    default: 'public'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  avatar: {
    type: String,
    default: null
  },
  settings: {
    allowInvites: {
      type: Boolean,
      default: true
    },
    allowFileUploads: {
      type: Boolean,
      default: true
    },
    maxMembers: {
      type: Number,
      default: 100
    }
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
roomSchema.index({ type: 1 });
roomSchema.index({ 'members.user': 1 });
roomSchema.index({ lastActivity: -1 });

// Method to add member
roomSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  if (!existingMember) {
    this.members.push({
      user: userId,
      role,
      joinedAt: new Date(),
      lastRead: new Date()
    });
  }
};

// Method to remove member
roomSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
};

// Method to check if user is member
roomSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

// Method to get member role
roomSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

// Virtual for member count
roomSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

module.exports = mongoose.model('Room', roomSchema);