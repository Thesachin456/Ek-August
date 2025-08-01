import React, { useState } from 'react';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { Routes, Route } from 'react-router-dom';

import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import WelcomeScreen from './WelcomeScreen';
import UserProfile from './UserProfile';
import SearchResults from './SearchResults';
import { useChat } from '../../contexts/ChatContext';

const DRAWER_WIDTH = 320;

const ChatLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentRoom } = useChat();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
  };

  const drawer = (
    <Sidebar 
      onMobileClose={() => setMobileOpen(false)}
      onShowProfile={() => setShowProfile(true)}
      onShowSearch={() => setShowSearch(true)}
    />
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { md: DRAWER_WIDTH }, 
          flexShrink: { md: 0 } 
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: '100vh',
          overflow: 'hidden',
          bgcolor: 'background.default'
        }}
      >
        <Routes>
          <Route 
            path="/" 
            element={
              currentRoom ? (
                <ChatWindow 
                  onMobileMenuOpen={handleDrawerToggle}
                  isMobile={isMobile}
                />
              ) : (
                <WelcomeScreen 
                  onMobileMenuOpen={handleDrawerToggle}
                  isMobile={isMobile}
                />
              )
            } 
          />
          <Route 
            path="/room/:roomId" 
            element={
              <ChatWindow 
                onMobileMenuOpen={handleDrawerToggle}
                isMobile={isMobile}
              />
            } 
          />
        </Routes>
      </Box>

      {/* User Profile Modal */}
      <UserProfile 
        open={showProfile}
        onClose={handleCloseProfile}
      />

      {/* Search Results Modal */}
      <SearchResults 
        open={showSearch}
        onClose={handleCloseSearch}
      />
    </Box>
  );
};

export default ChatLayout;