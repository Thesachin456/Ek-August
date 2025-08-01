import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Chat,
  Group,
  Search,
  Settings
} from '@mui/icons-material';

const WelcomeScreen = ({ onMobileMenuOpen, isMobile }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
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
            Ek-August Chat
          </Typography>
        </Box>
      )}

      {/* Welcome content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          textAlign: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            maxWidth: 500,
            width: '100%'
          }}
        >
          <Chat 
            sx={{ 
              fontSize: 80, 
              color: theme.palette.primary.main,
              mb: 3 
            }} 
          />
          
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Welcome to Ek-August Chat
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph
            sx={{ mb: 4 }}
          >
            Connect with friends and communities in real-time. 
            Choose a chat room from the sidebar to start messaging!
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group color="primary" />
              <Typography variant="body2">Join Rooms</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Search color="primary" />
              <Typography variant="body2">Search Messages</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings color="primary" />
              <Typography variant="body2">Customize Profile</Typography>
            </Box>
          </Box>

          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontStyle: 'italic' }}
          >
            Real-time messaging • File sharing • Emoji reactions
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;