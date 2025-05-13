// import { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
// import { useAuth } from '../../context/AuthContext';

// const OAuthCallback = () => {
//   const { login, isAuthenticated, user } = useAuth();
//   const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
//   const [error, setError] = useState(null);
//   const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // First effect: Handle the initial check and authentication
//   useEffect(() => {
//     const handleInitialAuthentication = async () => {
//       // If already authenticated and we have user data, go to success immediately
//       if (isAuthenticated && user) {
//         console.log("Already authenticated with user data, skipping login");
//         setStatus('success');
//         return;
//       }

//       // Only process the OAuth code if we haven't tried login yet
//       if (!hasAttemptedLogin) {
//         try {
//           const urlParams = new URLSearchParams(location.search);
//           const code = urlParams.get('code');
          
//           if (!code) {
//             console.error("No code found in URL");
//             setError('No authorization code found. Please try again.');
//             setStatus('error');
//             return;
//           }
          
//           console.log("Attempting login with code");
//           setHasAttemptedLogin(true); // Mark that we've attempted login
          
//           // Don't update any state here - let the isAuthenticated effect handle it
//           await login(code);
          
//           // The state will be updated by the isAuthenticated effect
//         } catch (err) {
//           console.error('OAuth callback error:', err);
//           setError('An error occurred during authentication. Please try again.');
//           setStatus('error');
//         }
//       }
//     };

//     handleInitialAuthentication();
//   }, [login, location.search, isAuthenticated, user, hasAttemptedLogin]);

//   // Second effect: Watch for authentication state changes
//   useEffect(() => {
//     // Once we're authenticated and have attempted login, show success
//     if (isAuthenticated && user && hasAttemptedLogin) {
//       console.log("Login successful, showing success state");
//       setStatus('success');
//     }
//   }, [isAuthenticated, user, hasAttemptedLogin]);

//   // Third effect: Handle redirection after success
//   useEffect(() => {
//     if (status === 'success') {
//       const timer = setTimeout(() => {
//         console.log("Success state shown, redirecting");
//         navigate('/');
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [status, navigate]);

//   const handleRetry = () => {
//     navigate('/login');
//   };

//   return (
//     <Box sx={{ textAlign: 'center', p: 2 }}>
//       {status === 'processing' && (
//         <>
//           <CircularProgress size={40} sx={{ mb: 2 }} />
//           <Typography variant="h6">
//             Connecting to GitHub...
//           </Typography>
//           <Typography variant="body2" color="textSecondary">
//             Please wait while we authenticate your account.
//           </Typography>
//         </>
//       )}
      
//       {status === 'success' && (
//         <Alert severity="success" sx={{ mb: 2 }}>
//           Successfully authenticated! Redirecting...
//         </Alert>
//       )}
      
//       {status === 'error' && (
//         <>
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {error || 'Authentication failed. Please try again.'}
//           </Alert>
//           <Button variant="contained" color="primary" onClick={handleRetry}>
//             Try Again
//           </Button>
//         </>
//       )}
//     </Box>
//   );
// };

// export default OAuthCallback;

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const OAuthCallback = () => {
  const { login, isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [error, setError] = useState(null);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // First effect: Handle the initial check and authentication
  useEffect(() => {
    const handleInitialAuthentication = async () => {
      // If already authenticated and we have user data, go to success immediately
      if (isAuthenticated && user) {
        console.log("Already authenticated with user data, skipping login");
        setStatus('success');
        return;
      }

      // Only process the OAuth code if we haven't tried login yet
      if (!hasAttemptedLogin) {
        try {
          const urlParams = new URLSearchParams(location.search);
          const code = urlParams.get('code');
          
          if (!code) {
            console.error("No code found in URL");
            setError('No authorization code found. Please try again.');
            setStatus('error');
            return;
          }
          
          console.log("Attempting login with code");
          setHasAttemptedLogin(true); // Mark that we've attempted login
          
          // Don't update any state here - let the isAuthenticated effect handle it
          await login(code);
          
          // The state will be updated by the isAuthenticated effect
        } catch (err) {
          console.error('OAuth callback error:', err);
          setError('An error occurred during authentication. Please try again.');
          setStatus('error');
        }
      }
    };

    handleInitialAuthentication();
  }, [login, location.search, isAuthenticated, user, hasAttemptedLogin]);

  // Second effect: Watch for authentication state changes
  useEffect(() => {
    // Once we're authenticated and have attempted login, show success
    if (isAuthenticated && user && hasAttemptedLogin) {
      console.log("Login successful, showing success state");
      setStatus('success');
    }
  }, [isAuthenticated, user, hasAttemptedLogin]);

  // Third effect: Handle redirection after success
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        console.log("Success state shown, redirecting");
        navigate('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const handleRetry = () => {
    navigate('/login');
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      {status === 'processing' && (
        <>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6">
            Connecting to GitHub...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please wait while we authenticate your account.
          </Typography>
        </>
      )}
      
      {status === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Successfully authenticated! Redirecting...
        </Alert>
      )}
      
      {status === 'error' && (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Authentication failed. Please try again.'}
          </Alert>
          <Button variant="contained" color="primary" onClick={handleRetry}>
            Try Again
          </Button>
        </>
      )}
    </Box>
  );
};

export default OAuthCallback;