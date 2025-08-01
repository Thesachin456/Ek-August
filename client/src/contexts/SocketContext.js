import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      
      const newSocket = io(SOCKET_URL, {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        toast.success('Connected to chat server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
        toast.error('Disconnected from chat server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
        toast.error('Failed to connect to chat server');
      });

      // Handle online users updates
      newSocket.on('users:online', (users) => {
        setOnlineUsers(users);
      });

      // Handle typing indicators
      newSocket.on('typing:start', ({ userId, username, roomId }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(`${roomId}:${userId}`, { userId, username, roomId });
          return newMap;
        });
      });

      newSocket.on('typing:stop', ({ userId, roomId }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(`${roomId}:${userId}`);
          return newMap;
        });
      });

      // Handle errors
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'An error occurred');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  // Clean up typing indicators when socket disconnects
  useEffect(() => {
    if (!connected) {
      setTypingUsers(new Map());
    }
  }, [connected]);

  const sendMessage = (roomId, content, type = 'text', replyTo = null) => {
    if (socket && connected) {
      socket.emit('message:send', {
        roomId,
        content,
        type,
        replyTo
      });
    }
  };

  const joinRooms = (roomIds) => {
    if (socket && connected) {
      socket.emit('join:rooms', roomIds);
    }
  };

  const startTyping = (roomId) => {
    if (socket && connected) {
      socket.emit('typing:start', { roomId });
    }
  };

  const stopTyping = (roomId) => {
    if (socket && connected) {
      socket.emit('typing:stop', { roomId });
    }
  };

  const reactToMessage = (messageId, emoji) => {
    if (socket && connected) {
      socket.emit('message:react', { messageId, emoji });
    }
  };

  const uploadFile = (roomId, file) => {
    if (socket && connected) {
      const reader = new FileReader();
      reader.onload = (e) => {
        socket.emit('file:upload', {
          roomId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getTypingUsersForRoom = (roomId) => {
    return Array.from(typingUsers.values()).filter(user => user.roomId === roomId);
  };

  const value = {
    socket,
    connected,
    onlineUsers,
    typingUsers,
    sendMessage,
    joinRooms,
    startTyping,
    stopTyping,
    reactToMessage,
    uploadFile,
    getTypingUsersForRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;