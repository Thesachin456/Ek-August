import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

const Sidebar = ({ onMobileClose, onShowProfile, onShowSearch }) => {
  const { user, logout } = useAuth();
  const { rooms, setCurrentRoom, currentRoom } = useChat();

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        color: 'white'
      }}
    >
      {/* Header with user info */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={user?.avatar}
            sx={{ mr: 2, width: 40, height: 40 }}
            onClick={onShowProfile}
            style={{ cursor: 'pointer' }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {user?.username}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Online
            </Typography>
          </Box>
          <IconButton sx={{ color: 'white' }} onClick={logout}>
            <SettingsIcon />
          </IconButton>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
            onClick={onShowSearch}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Room list */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Typography variant="overline" sx={{ p: 2, opacity: 0.8 }}>
          Chat Rooms
        </Typography>
        
        <List sx={{ p: 0 }}>
          {rooms.map((room) => (
            <ListItem
              key={room._id}
              button
              selected={currentRoom?._id === room._id}
              onClick={() => handleRoomSelect(room)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <Avatar sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                {room.name?.[0]?.toUpperCase()}
              </Avatar>
              <ListItemText
                primary={room.name}
                secondary={`${room.members?.length || 0} members`}
                secondaryTypographyProps={{
                  sx: { color: 'rgba(255,255,255,0.7)' }
                }}
              />
            </ListItem>
          ))}
        </List>

        {rooms.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', opacity: 0.8 }}>
            <Typography variant="body2">
              No rooms yet. Create or join a room to start chatting!
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;