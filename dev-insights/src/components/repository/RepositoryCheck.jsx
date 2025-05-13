// // src/components/repository/RepositoryCheck.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Dialog, 
//   DialogTitle, 
//   DialogContent, 
//   DialogContentText,
//   DialogActions, 
//   Button, 
//   CircularProgress
// } from '@mui/material';
// import apiService from '../../services/apiService';

// const RepositoryCheck = ({ 
//   repoFullName, 
//   children, 
//   redirect = true,
//   onRepositoryStatus = null
// }) => {
//   const [loading, setLoading] = useState(true);
//   const [needsProcessing, setNeedsProcessing] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkRepository = async () => {
//       if (!repoFullName) {
//         setLoading(false);
//         return;
//       }

//       try {
//         // Check if repository exists and is processed in Neo4j
//         const status = await apiService.checkRepositoryStatus(repoFullName);
        
//         // If repository isn't properly processed, show dialog
//         if (!status.isProcessed) {
//           setNeedsProcessing(true);
//           setDialogOpen(true);
//         }
        
//         // Notify parent component of repository status if callback provided
//         if (onRepositoryStatus) {
//           onRepositoryStatus(status);
//         }
//       } catch (error) {
//         console.error('Error checking repository:', error);
//         setNeedsProcessing(true);
//         setDialogOpen(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkRepository();
//   }, [repoFullName, onRepositoryStatus]);

//   const handleProcessRepository = () => {
//     // Store the current path so we can redirect back after processing
//     if (redirect) {
//       localStorage.setItem('requested_path', window.location.pathname);
//       navigate(`/process-repository/${repoFullName}`);
//     }
//     setDialogOpen(false);
//   };

//   const handleSkip = () => {
//     setDialogOpen(false);
//   };

//   if (loading) {
//     return <CircularProgress size={24} />;
//   }

//   return (
//     <>
//       {children}
      
//       <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
//         <DialogTitle>Repository Processing Required</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             The repository <strong>{repoFullName}</strong> needs to be processed before 
//             you can view insights. This will fetch commit history and build the developer 
//             knowledge graph.
//             <br /><br />
//             This process may take 1-2 minutes depending on repository size.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleSkip} color="primary">
//             Skip for Now
//           </Button>
//           <Button onClick={handleProcessRepository} color="primary" variant="contained" autoFocus>
//             Process Repository
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default RepositoryCheck;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Dialog, 
//   DialogTitle, 
//   DialogContent, 
//   DialogContentText,
//   DialogActions, 
//   Button, 
//   CircularProgress
// } from '@mui/material';
// import apiService from '../../services/apiService';

// const RepositoryCheck = ({ 
//   repoFullName, 
//   children, 
//   redirect = true,
//   onRepositoryStatus = null
// }) => {
//   const [loading, setLoading] = useState(true);
//   const [needsProcessing, setNeedsProcessing] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkRepository = async () => {
//       if (!repoFullName) {
//         setLoading(false);
//         return;
//       }

//       try {
//         // Check if repository exists and is processed in Neo4j
//         const status = await apiService.checkRepositoryStatus(repoFullName);
        
//         // If repository isn't properly processed, show dialog
//         if (!status.isProcessed) {
//           setNeedsProcessing(true);
//           setDialogOpen(true);
//         }
        
//         // Notify parent component of repository status if callback provided
//         if (onRepositoryStatus) {
//           onRepositoryStatus(status);
//         }
//       } catch (error) {
//         console.error('Error checking repository:', error);
//         setNeedsProcessing(true);
//         setDialogOpen(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkRepository();
//   }, [repoFullName, onRepositoryStatus]);

//   // Create a separate function for navigation that's not directly tied to dialog events
//   const navigateToProcessing = () => {
//     console.log("Navigating to processing page:", `/process-repository/${encodeURIComponent(repoFullName)}`);
    
//     try {
//       // Store the current path for redirect after processing
//       if (redirect) {
//         localStorage.setItem('requested_path', window.location.pathname);
//       }
      
//       // Use setTimeout to break event chain
//       setTimeout(() => {
//         try {
//           navigate(`/process-repository/${encodeURIComponent(repoFullName)}`);
//         } catch (error) {
//           console.error("Navigation failed:", error);
//           // Fallback to direct URL change
//           window.location.href = `/process-repository/${encodeURIComponent(repoFullName)}`;
//         }
//       }, 0);
//     } catch (error) {
//       console.error("Error during navigation setup:", error);
//     }
//   };

//   const handleProcessRepository = (event) => {
//     // Prevent default behavior and stop propagation
//     if (event) {
//       event.preventDefault();
//       event.stopPropagation();
//     }
    
//     console.log("Process repository button clicked");
    
//     // Close dialog first
//     setDialogOpen(false);
    
//     // Navigate after dialog is closed
//     setTimeout(() => {
//       navigateToProcessing();
//     }, 100);
//   };

//   const handleSkip = () => {
//     setDialogOpen(false);
//   };

//   if (loading) {
//     return <CircularProgress size={24} />;
//   }

//   return (
//     <>
//       {children}
      
//       <Dialog 
//         open={dialogOpen} 
//         onClose={() => setDialogOpen(false)}
//         disablePortal={false}
//         keepMounted
//       >
//         <DialogTitle>Repository Processing Required</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             The repository <strong>{repoFullName}</strong> needs to be processed before 
//             you can view insights. This will fetch commit history and build the developer 
//             knowledge graph.
//             <br /><br />
//             This process may take 1-2 minutes depending on repository size.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleSkip} color="primary">
//             Skip for Now
//           </Button>
//           <Button 
//             onClick={handleProcessRepository} 
//             color="primary" 
//             variant="contained" 
//             autoFocus
//           >
//             Process Repository
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default RepositoryCheck;

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions, 
  Button, 
  CircularProgress,
  Box
} from '@mui/material';
import apiService from '../../services/apiService';

const RepositoryCheck = ({ 
  repoFullName, 
  children, 
  redirect = true,
  onRepositoryStatus = null
}) => {
  const [loading, setLoading] = useState(true);
  const [needsProcessing, setNeedsProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const navigationAttempted = useRef(false);

  // Reset navigation attempt flag when component mounts or repoFullName changes
  useEffect(() => {
    navigationAttempted.current = false;
    console.log("RepositoryCheck mounted/updated for:", repoFullName);
  }, [repoFullName]);

  useEffect(() => {
    const checkRepository = async () => {
      if (!repoFullName) {
        setLoading(false);
        return;
      }

      try {
        // Check if repository exists and is processed in Neo4j
        const status = await apiService.checkRepositoryStatus(repoFullName);
        console.log("Repository check status for:", repoFullName, status);
        
        // If repository isn't properly processed, show dialog
        if (!status.isProcessed) {
          console.log("Repository needs processing:", repoFullName);
          setNeedsProcessing(true);
          setDialogOpen(true);
        } else {
          console.log("Repository already processed:", repoFullName);
        }
        
        // Notify parent component of repository status if callback provided
        if (onRepositoryStatus) {
          onRepositoryStatus(status);
        }
      } catch (error) {
        console.error('Error checking repository:', error);
        setNeedsProcessing(true);
        setDialogOpen(true);
      } finally {
        setLoading(false);
      }
    };

    checkRepository();
  }, [repoFullName, onRepositoryStatus]);

  // Separate function to handle navigation to processing page
  const navigateToProcessing = () => {
    // Prevent duplicate navigation attempts
    if (navigationAttempted.current) {
      console.log("Navigation already attempted, ignoring duplicate call");
      return;
    }
    
    navigationAttempted.current = true;
    
    try {
      // Store the current path for redirect after processing
      if (redirect) {
        const currentPath = window.location.pathname;
        console.log(`Saving path for redirect: ${currentPath}`);
        
        // Store both as localStorage and sessionStorage for redundancy
        localStorage.setItem('requested_path', currentPath);
        sessionStorage.setItem('requested_path', currentPath);
        
        // Also store a timestamp to help with debugging
        localStorage.setItem('requested_path_time', new Date().toISOString());
      }
      
      const processingUrl = `/process-repository/${encodeURIComponent(repoFullName)}`;
      console.log(`Navigating to processing page: ${processingUrl}`);
      
      // Use a timeout to ensure we're outside the current event cycle
      setTimeout(() => {
        try {
          navigate(processingUrl);
        } catch (error) {
          console.error("Navigation failed:", error);
          // Fallback to direct URL change if React navigation fails
          window.location.href = processingUrl;
        }
      }, 100);
    } catch (error) {
      console.error("Error during navigation setup:", error);
    }
  };

  const handleProcessRepository = (event) => {
    // Prevent default behavior and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log("Process repository button clicked");
    
    // Close dialog first
    setDialogOpen(false);
    
    // Navigate after dialog is closed
    setTimeout(() => {
      navigateToProcessing();
    }, 100);
  };

  const handleSkip = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} />
        <span>Checking repository status...</span>
      </Box>
    );
  }

  return (
    <>
      {children}
      
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        disablePortal={false}
        keepMounted
      >
        <DialogTitle>Repository Processing Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The repository <strong>{repoFullName}</strong> needs to be processed before 
            you can view insights. This will fetch commit history and build the developer 
            knowledge graph.
            <br /><br />
            This process may take 1-2 minutes depending on repository size.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSkip} color="primary">
            Skip for Now
          </Button>
          <Button 
            onClick={handleProcessRepository} 
            color="primary" 
            variant="contained" 
            autoFocus
          >
            Process Repository
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RepositoryCheck;