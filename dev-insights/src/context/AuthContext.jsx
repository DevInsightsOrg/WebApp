import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);

  // Load token and validate on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await authService.validateToken();
        if (data && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  // In your AuthProvider component, update the login function:

const login = async (code) => {
  // Prevent multiple concurrent login attempts
  if (isLoginInProgress) {
    console.log("Login already in progress, skipping");
    return false;
  }
  
  setIsLoginInProgress(true);
  setAuthError(null);
  
  try {
    // If we're already authenticated, no need to login again
    if (isAuthenticated && user) {
      console.log("Already authenticated, skipping login");
      return true;
    }
    
    console.time('login-exchange');
    const data = await authService.exchangeCodeForToken(code);
    console.timeEnd('login-exchange');
    
    // Check if we received a token (minimal requirement for authentication)
    if (data && data.token) {
      console.log("Received valid token");
      
      // Set as authenticated as soon as we have a token
      setIsAuthenticated(true);
      
      // If we also received user data, set it
      if (data.user) {
        console.log("Received user data with token");
        setUser(data.user);
      } else {
        // If no user data, try to fetch it separately
        console.log("No user data received, fetching separately");
        try {
          const userData = await authService.validateToken();
          if (userData && userData.user) {
            setUser(userData.user);
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          // Continue anyway as we have the token
        }
      }
      
      return true;
    }
    
    console.error("Invalid response from authentication server");
    setAuthError('Invalid response from authentication server');
    return false;
  } catch (error) {
    console.error('Login failed:', error);
    setAuthError(error.message || 'Authentication failed');
    return false;
  } finally {
    setIsLoginInProgress(false);
  }
};

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authError,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};