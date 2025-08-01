import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Chat } from '@mui/icons-material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Chat sx={{ fontSize: 48, mr: 2 }} />
        <Typography variant="h3" fontWeight="bold">
          Ek-August Chat
        </Typography>
      </Box>
      
      <CircularProgress 
        size={60} 
        sx={{ 
          color: 'white',
          mb: 2
        }} 
      />
      
      <Typography variant="h6" sx={{ opacity: 0.8 }}>
        Loading...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;