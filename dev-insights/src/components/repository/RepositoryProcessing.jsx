// // // src/components/repository/RepositoryProcessing.jsx
// // import { useState, useEffect } from 'react';
// // import { 
// //   Box, 
// //   Typography, 
// //   CircularProgress, 
// //   Paper, 
// //   Button,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogContentText,
// //   DialogActions,
// //   LinearProgress
// // } from '@mui/material';
// // import { useNavigate } from 'react-router-dom';
// // import apiService from '../../services/apiService';

// // const RepositoryProcessing = ({ 
// //   repoFullName, 
// //   onProcessingComplete, 
// //   onCancel 
// // }) => {
// //   const [progress, setProgress] = useState(0);
// //   const [status, setStatus] = useState('Initializing repository processing...');
// //   const [error, setError] = useState(null);
  
// //   useEffect(() => {
// //     const processRepository = async () => {
// //       try {
// //         setStatus('Fetching repository commit data...');
// //         setProgress(10);
        
// //         // Split repository full name into owner/repo format
// //         const [owner, repo] = repoFullName.split('/');
        
// //         // Process repository commits
// //         const result = await apiService.fetchRepositoryCommits(repoFullName);
        
// //         setProgress(80);
// //         setStatus('Finalizing repository setup...');
        
// //         // Check if processing was successful
// //         if (result && result.commits) {
// //           setProgress(100);
// //           setStatus('Repository processing completed successfully!');
          
// //           // Wait a moment to show completion before proceeding
// //           setTimeout(() => {
// //             if (onProcessingComplete) {
// //               onProcessingComplete(true);
// //             }
// //           }, 1000);
// //         } else {
// //           throw new Error('Failed to process repository: No commits returned');
// //         }
// //       } catch (error) {
// //         console.error('Repository processing failed:', error);
// //         setError(`Processing failed: ${error.message || 'Unknown error'}`);
// //         if (onProcessingComplete) {
// //           onProcessingComplete(false, error);
// //         }
// //       }
// //     };
    
// //     processRepository();
// //   }, [repoFullName, onProcessingComplete]);
  
// //   const handleCancel = () => {
// //     if (onCancel) {
// //       onCancel();
// //     }
// //   };
  
// //   return (
// //     <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
// //       <Typography variant="h5" gutterBottom>
// //         Processing Repository
// //       </Typography>
      
// //       <Typography variant="subtitle1" sx={{ mb: 3 }}>
// //         {repoFullName}
// //       </Typography>
      
// //       <Box sx={{ width: '100%', mb: 3 }}>
// //         <LinearProgress 
// //           variant="determinate" 
// //           value={progress} 
// //           sx={{ height: 10, borderRadius: 5 }}
// //         />
// //         <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
// //           {progress}%
// //         </Typography>
// //       </Box>
      
// //       <Typography variant="body1" sx={{ mb: 3 }}>
// //         {status}
// //       </Typography>
      
// //       <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
// //         This process analyzes your repository commits, files, and developer contributions.
// //         It may take 1-2 minutes to complete depending on repository size.
// //       </Typography>
      
// //       {error && (
// //         <Box sx={{ mb: 3, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
// //           <Typography color="error">{error}</Typography>
// //           <Button 
// //             variant="outlined" 
// //             color="error" 
// //             sx={{ mt: 1 }}
// //             onClick={handleCancel}
// //           >
// //             Go Back
// //           </Button>
// //         </Box>
// //       )}
      
// //       {!error && progress < 100 && (
// //         <Button 
// //           variant="outlined" 
// //           color="secondary" 
// //           sx={{ mt: 2 }}
// //           onClick={handleCancel}
// //         >
// //           Cancel Processing
// //         </Button>
// //       )}
// //     </Paper>
// //   );
// // };

// // export default RepositoryProcessing;

// // src/components/repository/RepositoryProcessing.jsx
// import { useState, useEffect, useRef } from 'react';
// import { 
//   Box, 
//   Typography, 
//   CircularProgress, 
//   Paper, 
//   Button,
//   LinearProgress,
//   Alert
// } from '@mui/material';
// import { useRepo } from '../../context/RepoContext';

// const RepositoryProcessing = ({ 
//   repoFullName, 
//   onProcessingComplete, 
//   onCancel 
// }) => {
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState('Initializing repository processing...');
//   const [error, setError] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(true);
//   const { processRepository } = useRepo();
  
//   // Flag to track if component is mounted
//   const isMounted = useRef(true);
//   // Flag to track if processing has already started
//   const processingStarted = useRef(false);
//   // Flag to track if completion callback was already called
//   const completionCalled = useRef(false);

//   // Progress timer
//   const progressTimer = useRef(null);
  
//   // Cleanup function
//   useEffect(() => {
//     return () => {
//       console.log("RepositoryProcessing component unmounting");
//       isMounted.current = false;
      
//       // Clear any running timers
//       if (progressTimer.current) {
//         clearInterval(progressTimer.current);
//         progressTimer.current = null;
//       }
//     };
//   }, []);
  
//   // Setup simulated progress updates
//   useEffect(() => {
//     // Don't start progress animation until processing begins
//     if (!isProcessing || progress >= 100) return;
    
//     const simulateProgress = () => {
//       // Start from current progress, increment slowly
//       let currentProgress = progress;
      
//       progressTimer.current = setInterval(() => {
//         if (!isMounted.current) {
//           clearInterval(progressTimer.current);
//           return;
//         }
        
//         // Increment progress but never reach 100% until complete
//         if (currentProgress < 90) {
//           currentProgress += 0.5;
//           setProgress(currentProgress);
//         }
//       }, 500);
//     };
    
//     simulateProgress();
    
//     return () => {
//       if (progressTimer.current) {
//         clearInterval(progressTimer.current);
//       }
//     };
//   }, [isProcessing, progress]);
  
//   // Repository processing effect
//   useEffect(() => {
//     const processRepo = async () => {
//       // Prevent multiple processing attempts
//       if (processingStarted.current || !repoFullName) return;
      
//       // Mark processing as started
//       processingStarted.current = true;
      
//       try {
//         console.log("Starting repository processing for:", repoFullName);
        
//         if (isMounted.current) {
//           setStatus('Fetching repository commit data...');
//           setProgress(10);
//         }
        
//         // Process the repository using the context method
//         const success = await processRepository(repoFullName);
        
//         // If component is unmounted, don't update state
//         if (!isMounted.current) return;
        
//         // Check if processing was successful
//         if (success) {
//           // Stop progress timer
//           if (progressTimer.current) {
//             clearInterval(progressTimer.current);
//             progressTimer.current = null;
//           }
          
//           setProgress(100);
//           setStatus('Repository processing completed successfully!');
//           setIsProcessing(false);
          
//           // Wait a moment to show completion before proceeding
//           setTimeout(() => {
//             if (isMounted.current && onProcessingComplete && !completionCalled.current) {
//               console.log("Calling onProcessingComplete with success=true");
//               completionCalled.current = true;
//               onProcessingComplete(true);
//             }
//           }, 1500);
//         } else {
//           throw new Error('Failed to process repository: Processing returned false');
//         }
//       } catch (error) {
//         console.error('Repository processing failed:', error);
        
//         // If component is unmounted, don't update state
//         if (!isMounted.current) return;
        
//         // Stop progress timer
//         if (progressTimer.current) {
//           clearInterval(progressTimer.current);
//           progressTimer.current = null;
//         }
        
//         setError(`Processing failed: ${error.message || 'Unknown error'}`);
//         setIsProcessing(false);
        
//         // Notify parent of failure
//         if (onProcessingComplete && !completionCalled.current) {
//           console.log("Calling onProcessingComplete with success=false");
//           completionCalled.current = true;
//           onProcessingComplete(false, error);
//         }
//       }
//     };
    
//     // Start processing
//     processRepo();
//   }, [repoFullName, onProcessingComplete, processRepository]);
  
//   const handleCancel = () => {
//     // Only allow cancellation if still processing
//     if (!isProcessing) return;
    
//     console.log("User cancelled processing");
//     setIsProcessing(false);
    
//     // Stop progress timer
//     if (progressTimer.current) {
//       clearInterval(progressTimer.current);
//       progressTimer.current = null;
//     }
    
//     // Call cancel callback if not already completed
//     if (onCancel && !completionCalled.current) {
//       completionCalled.current = true;
//       onCancel();
//     }
//   };
  
//   return (
//     <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
//       <Typography variant="h5" gutterBottom>
//         Processing Repository
//       </Typography>
      
//       <Typography variant="subtitle1" sx={{ mb: 3 }}>
//         {repoFullName}
//       </Typography>
      
//       <Box sx={{ width: '100%', mb: 3 }}>
//         <LinearProgress 
//           variant={isProcessing && progress < 100 ? "indeterminate" : "determinate"}
//           value={progress} 
//           sx={{ height: 10, borderRadius: 5 }}
//         />
//         <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
//           {progress < 100 ? 'Processing...' : '100% Complete'}
//         </Typography>
//       </Box>
      
//       <Typography variant="body1" sx={{ mb: 3 }}>
//         {status}
//       </Typography>
      
//       <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//         This process analyzes your repository commits, files, and developer contributions.
//         It may take 1-2 minutes to complete depending on repository size.
//       </Typography>
      
//       {error && (
//         <Box sx={{ mb: 3, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
//           <Typography color="error">{error}</Typography>
//           <Button 
//             variant="outlined" 
//             color="error" 
//             sx={{ mt: 1 }}
//             onClick={handleCancel}
//           >
//             Go Back
//           </Button>
//         </Box>
//       )}
      
//       {!error && isProcessing && (
//         <Button 
//           variant="outlined" 
//           color="secondary" 
//           sx={{ mt: 2 }}
//           onClick={handleCancel}
//         >
//           Cancel Processing
//         </Button>
//       )}
      
//       {!error && !isProcessing && progress === 100 && (
//         <Alert severity="success" sx={{ mt: 2 }}>
//           Repository successfully processed! Redirecting...
//         </Alert>
//       )}
//     </Paper>
//   );
// };

// export default RepositoryProcessing;

import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Button,
  LinearProgress,
  Alert
} from '@mui/material';
import { useRepo } from '../../context/RepoContext';
import apiService from '../../services/apiService';

const RepositoryProcessing = ({ 
  repoFullName, 
  onProcessingComplete, 
  onCancel 
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing repository processing...');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const { processRepository } = useRepo();
  
  // Flag to track if component is mounted
  const isMounted = useRef(true);
  // Flag to track if processing has already started
  const processingStarted = useRef(false);
  // Flag to track if completion callback was already called
  const completionCalled = useRef(false);
  // Progress timer
  const progressTimer = useRef(null);
  // Status polling interval
  const statusPollingInterval = useRef(null);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      console.log("RepositoryProcessing component unmounting");
      isMounted.current = false;
      
      // Clear any running timers
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
      
      // Clear status polling
      if (statusPollingInterval.current) {
        clearInterval(statusPollingInterval.current);
        statusPollingInterval.current = null;
      }
    };
  }, []);
  
  // Setup simulated progress updates
  useEffect(() => {
    // Don't start progress animation until processing begins
    if (!isProcessing || progress >= 100) return;
    
    const simulateProgress = () => {
      // Start from current progress, increment slowly
      let currentProgress = progress;
      
      progressTimer.current = setInterval(() => {
        if (!isMounted.current) {
          clearInterval(progressTimer.current);
          return;
        }
        
        // Increment progress but never reach 100% until complete
        if (currentProgress < 90) {
          currentProgress += 0.5;
          setProgress(currentProgress);
        }
      }, 500);
    };
    
    simulateProgress();
    
    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [isProcessing, progress]);
  
  // Add a new effect for status polling
  // In RepositoryProcessing.jsx - update the status polling effect
useEffect(() => {
  // Don't start polling if not processing or no repo name
  if (!isProcessing || !repoFullName) return;
  
  console.log("Starting repository status polling for:", repoFullName);
  
  // Function to check repository status
  const checkStatus = async () => {
    try {
      if (!isMounted.current) {
        console.log("Component no longer mounted, skipping status check");
        return;
      }
  
      console.log("Polling repository status for:", repoFullName);
      const status = await apiService.checkRepositoryStatus(repoFullName);
      console.log("Repository status check result:", status);
      
      // If repository is now processed, complete the processing
      if (status.isProcessed) {
        console.log("Repository is now processed, completing the flow");
        
        // Stop polling
        if (statusPollingInterval.current) {
          clearInterval(statusPollingInterval.current);
          statusPollingInterval.current = null;
        }
        
        // Stop progress timer
        if (progressTimer.current) {
          clearInterval(progressTimer.current);
          progressTimer.current = null;
        }
        
        if (isMounted.current) {
          setProgress(100);
          setStatus('Repository processing completed successfully!');
          setIsProcessing(false);
          
          // Prevent potential race conditions with multiple callbacks
          if (!completionCalled.current) {
            completionCalled.current = true; // Set this first to prevent duplicate calls
            console.log("Marking completion callback as called");
            
            // Give UI time to update before navigation
            setTimeout(() => {
              if (isMounted.current && onProcessingComplete) {
                console.log("Executing onProcessingComplete callback");
                onProcessingComplete(true);
              }
            }, 1000);
          }
        }
      } else {
        console.log("Repository not yet processed, continuing to poll");
      }
    } catch (error) {
      console.error("Error checking repository status:", error);
    }
  };
  
  // Set up polling every 3 seconds (faster polling)
  statusPollingInterval.current = setInterval(checkStatus, 3000);
  
  // Initial status check
  checkStatus();
  
  return () => {
    console.log("Cleaning up status polling");
    if (statusPollingInterval.current) {
      clearInterval(statusPollingInterval.current);
      statusPollingInterval.current = null;
    }
  };
}, [isProcessing, repoFullName, onProcessingComplete]);
  
  // Repository processing effect
  useEffect(() => {
    const processRepo = async () => {
      // Prevent multiple processing attempts
      if (processingStarted.current || !repoFullName) return;
      
      // Mark processing as started
      processingStarted.current = true;
      
      try {
        console.log("Starting repository processing for:", repoFullName);
        
        if (isMounted.current) {
          setStatus('Fetching repository commit data...');
          setProgress(10);
        }
        
        // Process the repository using the context method
        await processRepository(repoFullName);
        
        // Don't immediately mark as success - let the status polling handle that
        // This helps with the case where the UI needs to wait for the backend
        // to fully process and update the database
        
        // Update progress to indicate the request was sent successfully
        if (isMounted.current) {
          setProgress(50);
          setStatus('Repository processing in progress. This may take a minute or two...');
        }
        
      } catch (error) {
        console.error('Repository processing failed:', error);
        
        // If component is unmounted, don't update state
        if (!isMounted.current) return;
        
        // Stop progress timer
        if (progressTimer.current) {
          clearInterval(progressTimer.current);
          progressTimer.current = null;
        }
        
        // Stop status polling
        if (statusPollingInterval.current) {
          clearInterval(statusPollingInterval.current);
          statusPollingInterval.current = null;
        }
        
        setError(`Processing failed: ${error.message || 'Unknown error'}`);
        setIsProcessing(false);
        
        // Notify parent of failure
        if (onProcessingComplete && !completionCalled.current) {
          console.log("Calling onProcessingComplete with success=false");
          completionCalled.current = true;
          onProcessingComplete(false, error);
        }
      }
    };
    
    // Start processing
    processRepo();
  }, [repoFullName, onProcessingComplete, processRepository]);
  
  const handleCancel = () => {
    // Only allow cancellation if still processing
    if (!isProcessing) return;
    
    console.log("User cancelled processing");
    setIsProcessing(false);
    
    // Stop progress timer
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    
    // Stop status polling
    if (statusPollingInterval.current) {
      clearInterval(statusPollingInterval.current);
      statusPollingInterval.current = null;
    }
    
    // Call cancel callback if not already completed
    if (onCancel && !completionCalled.current) {
      completionCalled.current = true;
      onCancel();
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Processing Repository
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        {repoFullName}
      </Typography>
      
      <Box sx={{ width: '100%', mb: 3 }}>
        <LinearProgress 
          variant={isProcessing && progress < 100 ? "indeterminate" : "determinate"}
          value={progress} 
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          {progress < 100 ? 'Processing...' : '100% Complete'}
        </Typography>
      </Box>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        {status}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This process analyzes your repository commits, files, and developer contributions.
        It may take 1-2 minutes to complete depending on repository size.
      </Typography>
      
      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="outlined" 
            color="error" 
            sx={{ mt: 1 }}
            onClick={handleCancel}
          >
            Go Back
          </Button>
        </Box>
      )}
      
      {!error && isProcessing && (
        <Button 
          variant="outlined" 
          color="secondary" 
          sx={{ mt: 2 }}
          onClick={handleCancel}
        >
          Cancel Processing
        </Button>
      )}
      
      {!error && !isProcessing && progress === 100 && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Repository successfully processed! Redirecting...
        </Alert>
      )}
    </Paper>
  );
};

export default RepositoryProcessing;