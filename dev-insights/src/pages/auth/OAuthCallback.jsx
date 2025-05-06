import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const OAuthCallback = () => {
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract code from URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setError('No authorization code found. Please try again.');
          setProcessing(false);
          return;
        }
        
        // Exchange code for token
        const success = await login(code);
        
        if (success) {
          navigate('/');
        } else {
          setError('Authentication failed. Please try again.');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An error occurred during authentication. Please try again.');
      } finally {
        setProcessing(false);
      }
    };

    if (!isAuthenticated) {
      handleOAuthCallback();
    } else {
      // If already authenticated, redirect to dashboard
      navigate('/');
    }
  }, [login, navigate, location.search, isAuthenticated]);

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      {processing ? (
        <>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6">
            Connecting to GitHub...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please wait while we authenticate your account.
          </Typography>
        </>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 2 }}>
          Successfully authenticated! Redirecting...
        </Alert>
      )}
    </Box>
  );
};

export default OAuthCallback;