import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

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
        const data = await apiService.validateToken();
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
      
      const data = await apiService.exchangeCodeForToken(code);
      
      if (data && data.token && data.user) {
        // Only update state if we have both token and user
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
      
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