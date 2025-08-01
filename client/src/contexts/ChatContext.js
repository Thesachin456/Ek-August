import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  
  const { socket, joinRooms } = useSocket();
  const { user } = useAuth();

  // Load user's rooms
  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/chat/rooms');
      setRooms(response.data.rooms);
      
      // Join all rooms via socket
      const roomIds = response.data.rooms.map(room => room._id);
      joinRooms(roomIds);
      
    } catch (error) {
      console.error('Load rooms error:', error);
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  }, [joinRooms]);

  // Load messages for a room
  const loadMessages = useCallback(async (roomId, page = 1) => {
    try {
      const response = await axios.get(`/chat/rooms/${roomId}/messages`, {
        params: { page, limit: 50 }
      });
      
      if (page === 1) {
        setMessages(response.data.messages);
      } else {
        setMessages(prev => [...response.data.messages, ...prev]);
      }
      
      return response.data.hasMore;
    } catch (error) {
      console.error('Load messages error:', error);
      toast.error('Failed to load messages');
      return false;
    }
  }, []);

  // Create new room
  const createRoom = async (roomData) => {
    try {
      const response = await axios.post('/chat/rooms', roomData);
      const newRoom = response.data.room;
      
      setRooms(prev => [newRoom, ...prev]);
      joinRooms([newRoom._id]);
      
      toast.success('Room created successfully');
      return { success: true, room: newRoom };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create room';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Join a public room
  const joinRoom = async (roomId) => {
    try {
      const response = await axios.post(`/chat/rooms/${roomId}/join`);
      const room = response.data.room;
      
      setRooms(prev => [room, ...prev]);
      joinRooms([room._id]);
      
      toast.success('Joined room successfully');
      return { success: true, room };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join room';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Leave a room
  const leaveRoom = async (roomId) => {
    try {
      await axios.post(`/chat/rooms/${roomId}/leave`);
      
      setRooms(prev => prev.filter(room => room._id !== roomId));
      
      if (currentRoom?._id === roomId) {
        setCurrentRoom(null);
        setMessages([]);
      }
      
      toast.success('Left room successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to leave room';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Search messages
  const searchMessages = async (query, roomId = null) => {
    try {
      const params = { q: query };
      if (roomId) params.roomId = roomId;
      
      const response = await axios.get('/chat/search', { params });
      setSearchResults(response.data.messages);
      
      return response.data.messages;
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
      return [];
    }
  };

  // Load public rooms
  const loadPublicRooms = async (search = '') => {
    try {
      const params = search ? { search } : {};
      const response = await axios.get('/chat/rooms/public', { params });
      setPublicRooms(response.data.rooms);
      
      return response.data.rooms;
    } catch (error) {
      console.error('Load public rooms error:', error);
      toast.error('Failed to load public rooms');
      return [];
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Handle new messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      
      // Update room's last message
      setRooms(prev => prev.map(room => 
        room._id === message.room 
          ? { ...room, lastMessage: message, lastActivity: message.createdAt }
          : room
      ));

      // Show notification if not in current room
      if (!currentRoom || currentRoom._id !== message.room) {
        if (message.sender._id !== user._id) {
          toast.success(`New message from ${message.sender.username}`, {
            duration: 3000,
            icon: '💬'
          });
        }
      }
    };

    // Handle message reactions
    const handleMessageReaction = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, reactions }
          : msg
      ));
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:reaction', handleMessageReaction);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:reaction', handleMessageReaction);
    };
  }, [socket, currentRoom, user._id]);

  // Load initial data
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Load messages when current room changes
  useEffect(() => {
    if (currentRoom) {
      loadMessages(currentRoom._id);
    } else {
      setMessages([]);
    }
  }, [currentRoom, loadMessages]);

  const value = {
    rooms,
    currentRoom,
    setCurrentRoom,
    messages,
    loading,
    searchResults,
    publicRooms,
    loadRooms,
    loadMessages,
    createRoom,
    joinRoom,
    leaveRoom,
    searchMessages,
    loadPublicRooms,
    setSearchResults
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;