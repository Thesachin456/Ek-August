import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Chat
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Chat sx={{ fontSize: 40, mr: 2, color: 'white' }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Ek-August Chat
            </Typography>
          </Box>
          
          <Typography variant="h5" sx={{ mb: 4 }}>
            Welcome Back
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white'
                  }
                }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255,255,255,0.7)' }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white'
                }
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white'
                  }
                }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255,255,255,0.7)' }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white'
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)'
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'underline',
                    fontWeight: 'bold'
                  }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Real-time chat with friends and communities
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;