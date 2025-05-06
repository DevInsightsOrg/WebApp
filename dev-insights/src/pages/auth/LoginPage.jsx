import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleGitHubLogin = () => {
    setLoggingIn(true);
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/oauth/callback`;
    const scope = 'repo,read:user,user:email';
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <Typography variant="body1" paragraph>
        Connect with your GitHub account to analyze your repositories
        and gain valuable insights about your development team.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<GitHubIcon />}
        onClick={handleGitHubLogin}
        disabled={loggingIn}
        sx={{ mt: 2 }}
      >
        {loggingIn ? (
          <>
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
            Connecting to GitHub...
          </>
        ) : (
          'Connect with GitHub'
        )}
      </Button>
      
      <Typography variant="caption" display="block" sx={{ mt: 3, color: 'text.secondary' }}>
        DevInsights requires access to your GitHub repositories to provide analytics.
        We only collect the data needed for analytics and never store your code.
      </Typography>
    </Box>
  );
};

export default LoginPage;