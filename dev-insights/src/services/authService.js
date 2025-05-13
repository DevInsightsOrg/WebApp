// import api from './apiConfig';

// const authService = {
//   // Auth endpoints
//   exchangeCodeForToken: async (code) => {
//     // Track if we've already started this request to avoid duplicates
//     const pendingKey = `pendingExchange_${code.substring(0, 10)}`;
    
//     // If already processing this code, wait for the result
//     if (window[pendingKey]) {
//       console.log("Exchange already in progress for this code, waiting");
//       try {
//         return await window[pendingKey];
//       } catch (error) {
//         console.error("Pending request failed:", error);
//         // Continue with a new request
//       }
//     }
    
//     // Create a promise to track this request
//     const exchangePromise = (async () => {
//       try {
//         console.log("Exchanging code for token:", code.substring(0, 10) + "...");
        
//         // Check if we already have a token
//         const existingToken = localStorage.getItem('auth_token');
        
//         if (existingToken) {
//           try {
//             // Try to validate the existing token
//             const validateResponse = await api.get('/auth/validate');
//             console.log("Existing token validated");
//             return {
//               token: existingToken,
//               user: validateResponse.data.user
//             };
//           } catch (error) {
//             // Token validation failed, continue with code exchange
//             console.log("Existing token invalid, will try code exchange");
//             console.error('Token validation failed:', error);
//             localStorage.removeItem('auth_token');
//           }
//         }
        
//         const response = await api.post('/auth/github/callback', { code });
//         console.log("Token exchange response received");
        
//         // Store the token in localStorage
//         if (response.data.token) {
//           localStorage.setItem('auth_token', response.data.token);
//         }
        
//         return response.data;
//       } catch (error) {
//         console.error('Error exchanging code for token:', error);
        
//         // Handle code already used
//         if (error.response && error.response.status === 409) {
//           console.log("Code already used, checking for existing token");
          
//           // Try to validate any existing token
//           const existingToken = localStorage.getItem('auth_token');
//           if (existingToken) {
//             try {
//               const validateResponse = await api.get('/auth/validate');
//               console.log("Existing token validated after 409");
//               return {
//                 token: existingToken,
//                 user: validateResponse.data.user
//               };
//             } catch (validationError) {
//               console.error('Token validation failed after 409');
//               localStorage.removeItem('auth_token');
//               throw validationError;
//             }
//           }
//         }
        
//         throw error;
//       } finally {
//         // Clear the pending request marker
//         window[pendingKey] = null;
//       }
//     })();
    
//     // Store the promise to prevent duplicate requests
//     window[pendingKey] = exchangePromise;
    
//     return exchangePromise;
//   },

//   validateToken: async () => {
//     try {
//       const response = await api.get('/auth/validate');
//       return response.data;
//     } catch (error) {
//       console.error('Error validating token:', error);
//       throw error;
//     }
//   },
  
//   // Add a logout function
//   logout: () => {
//     localStorage.removeItem('auth_token');
//     localStorage.removeItem('selected_repo');
//     localStorage.removeItem('selected_repo_full_name');
//     // Clear any other auth-related data from localStorage
//   },
  
//   // Helper function to get the auth token
//   getToken: () => {
//     return localStorage.getItem('auth_token');
//   },
  
//   // Helper function to check if user is authenticated
//   isAuthenticated: () => {
//     return !!localStorage.getItem('auth_token');
//   },
  
//   // Set up headers with auth token
//   getAuthHeaders: () => {
//     const token = localStorage.getItem('auth_token');
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   }
// };

// export default authService;

import api from './apiConfig';

// Cache to store pending token exchanges
const pendingExchanges = {};

const authService = {
  // Auth endpoints
  exchangeCodeForToken: async (code) => {
    const pendingKey = `exchange_${code.substring(0, 10)}`;
    console.time('total-auth-process');
    
    // If already processing this code, return the existing promise
    if (pendingExchanges[pendingKey]) {
      console.log("Exchange already in progress, reusing promise");
      try {
        return await pendingExchanges[pendingKey];
      } catch (error) {
        console.error("Pending exchange failed:", error);
        delete pendingExchanges[pendingKey];
      }
    }
    
    // Create a promise with timeout
    const exchangePromise = (async () => {
      try {
        console.log(`Exchanging code: ${code.substring(0, 10)}...`);
        console.time('token-exchange');

        // Fast path: Check if we already have a valid token
        const existingToken = localStorage.getItem('auth_token');
        if (existingToken) {
          try {
            console.log("Found existing token, validating...");
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const validateResponse = await api.get('/auth/validate', { 
              signal: controller.signal,
              timeout: 3000
            });
            
            clearTimeout(timeoutId);
            console.log("Existing token validated successfully");
            console.timeEnd('token-exchange');
            
            return {
              token: existingToken,
              user: validateResponse.data.user
            };
          } catch (error) {
            console.log("Existing token invalid, continuing with exchange");
            if (error.name === 'AbortError') {
              console.warn("Validation request timed out");
            }
            localStorage.removeItem('auth_token');
          }
        }
        
        // Exchange code for token (with timeout)
        console.log("Performing new token exchange");
        const response = await api.post('/auth/github/callback', { code }, { timeout: 10000 });
        
        console.log("Token exchange completed");
        console.timeEnd('token-exchange');
        
        // Store token if received
        if (response.data && response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
          console.log("New token stored in localStorage");
        } else {
          console.warn("No token received in response");
        }
        
        console.timeEnd('total-auth-process');
        return response.data;
      } catch (error) {
        console.error('Token exchange failed:', error);
        
        // Handle code already used (409)
        if (error.response && error.response.status === 409) {
          console.log("Code already used, checking for existing token");
          const existingToken = localStorage.getItem('auth_token');
          
          if (existingToken) {
            try {
              const validateResponse = await api.get('/auth/validate', { timeout: 3000 });
              console.log("Existing token validated after 409");
              return {
                token: existingToken,
                user: validateResponse.data.user
              };
            } catch (validationError) {
              console.error('Final validation attempt failed: ', validationError);
              localStorage.removeItem('auth_token');
            }
          }
        }
        
        console.timeEnd('total-auth-process');
        throw error;
      } finally {
        // Clean up
        delete pendingExchanges[pendingKey];
      }
    })();
    
    // Store the promise
    pendingExchanges[pendingKey] = exchangePromise;
    
    return exchangePromise;
  },

  validateToken: async () => {
    try {
      console.time('validate-token');
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log("No token found in storage");
        console.timeEnd('validate-token');
        return { isValid: false };
      }
      
      const response = await api.get('/auth/validate', { timeout: 3000 });
      console.timeEnd('validate-token');
      return response.data;
    } catch (error) {
      console.error('Error validating token:', error);
      console.timeEnd('validate-token');
      throw error;
    }
  },
  
  // Other methods remain the same
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('selected_repo');
    localStorage.removeItem('selected_repo_full_name');
  },
  
  getToken: () => localStorage.getItem('auth_token'),
  
  isAuthenticated: () => !!localStorage.getItem('auth_token'),
  
  getAuthHeaders: () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authService;