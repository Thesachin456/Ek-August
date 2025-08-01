import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

const ChatWindow = ({ onMobileMenuOpen, isMobile }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header for mobile */}
      {isMobile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <IconButton
            edge="start"
            onClick={onMobileMenuOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Chat Room
          </Typography>
        </Box>
      )}

      {/* Chat content area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Chat Window Coming Soon...
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatWindow;