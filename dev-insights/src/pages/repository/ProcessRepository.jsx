// // src/pages/repository/ProcessRepository.jsx
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { 
//   Box, 
//   Typography, 
//   CircularProgress,
//   Container
// } from '@mui/material';
// import RepositoryProcessing from '../../components/repository/RepositoryProcessing';
// import { useRepo } from '../../context/RepoContext';

// const ProcessRepository = () => {
//   const { repoFullName } = useParams();
//   const navigate = useNavigate();
//   const { selectRepository, repositories } = useRepo();
//   const [isInitializing, setIsInitializing] = useState(true);

//   useEffect(() => {
//     // Find repository by full name
//     const findAndSelectRepo = () => {
//       const repo = repositories.find(r => r.fullName === repoFullName);
//       if (repo) {
//         selectRepository(repo.id, repo.fullName);
//       }
//       setIsInitializing(false);
//     };

//     findAndSelectRepo();
//   }, [repoFullName, repositories, selectRepository]);

//   const handleProcessingComplete = (success) => {
//     if (success) {
//       // Navigate to the previously requested page or default to traceability
//       const redirectPath = localStorage.getItem('requested_path') || '/reports/traceability';
//       localStorage.removeItem('requested_path'); // Clear the stored path
//       navigate(redirectPath);
//     } else {
//       // If processing fails, navigate to repositories page
//       navigate('/settings/repositories');
//     }
//   };

//   const handleCancel = () => {
//     navigate('/settings/repositories');
//   };

//   if (isInitializing) {
//     return (
//       <Container sx={{ mt: 4, textAlign: 'center' }}>
//         <CircularProgress />
//         <Typography sx={{ mt: 2 }}>Initializing repository processing...</Typography>
//       </Container>
//     );
//   }

//   return (
//     <Container>
//       <Box sx={{ py: 4 }}>
//         <RepositoryProcessing 
//           repoFullName={repoFullName}
//           onProcessingComplete={handleProcessingComplete}
//           onCancel={handleCancel}
//         />
//       </Box>
//     </Container>
//   );
// };

// export default ProcessRepository;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Container,
  Alert
} from '@mui/material';
import RepositoryProcessing from '../../components/repository/RepositoryProcessing';
import { useRepo } from '../../context/RepoContext';

const ProcessRepository = () => {
  const { repoFullName } = useParams();
  const navigate = useNavigate();
  const { selectRepository, repositories } = useRepo();
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [hasCompletedProcessing, setHasCompletedProcessing] = useState(false);

  // Debug logging for component lifecycle
  useEffect(() => {
    console.log("ProcessRepository mounted, repoFullName:", repoFullName);
    
    return () => {
      console.log("ProcessRepository unmounting");
    };
  }, [repoFullName]);

  useEffect(() => {
    // Find repository by full name
    const findAndSelectRepo = () => {
      // Make sure repoFullName is valid before proceeding
      if (!repoFullName) {
        setError("No repository name provided");
        setIsInitializing(false);
        return;
      }
      
      console.log("Finding repository:", repoFullName);
      console.log("Available repositories:", repositories);
      
      const decodedFullName = decodeURIComponent(repoFullName);
      // Try both encoded and decoded versions
      const repo = repositories.find(r => 
        r.fullName === repoFullName || r.fullName === decodedFullName
      );
      
      if (repo) {
        console.log("Found repository:", repo);
        selectRepository(repo.id, repo.fullName);
        setIsInitializing(false);
      } else {
        console.warn("Repository not found:", repoFullName);
        // If we can't find the repository, we'll still try to process it
        // as long as we have a valid name in the format "owner/repo"
        if (repoFullName.includes('/')) {
          console.log("Will try to process repository anyway");
          setIsInitializing(false);
        } else {
          setError(`Repository "${repoFullName}" not found`);
          setIsInitializing(false);
        }
      }
    };

    findAndSelectRepo();
  }, [repoFullName, repositories, selectRepository]);

  const handleProcessingComplete = (success, processingError) => {
  console.log("Processing completed, success:", success, "hasCompletedProcessing:", hasCompletedProcessing);
  
  // Prevent multiple navigation attempts
  if (hasCompletedProcessing) {
    console.log("Already completed processing, ignoring duplicate callback");
    return;
  }
  
  setHasCompletedProcessing(true);
  
  if (success) {
    // Try to get the redirect path from multiple sources for reliability
    let redirectPath = localStorage.getItem('requested_path') || 
                       sessionStorage.getItem('requested_path') || 
                       '/reports/traceability';
    
    // Log all stored paths for debugging
    console.log("Redirect paths in storage:", {
      localStorage: localStorage.getItem('requested_path'),
      sessionStorage: sessionStorage.getItem('requested_path'),
      timestamp: localStorage.getItem('requested_path_time')
    });
    
    // If we can't find a valid path, default to traceability
    if (!redirectPath || redirectPath === 'null' || redirectPath === 'undefined') {
      console.log("No valid redirect path found, using default");
      redirectPath = '/reports/traceability';
    }
    
    console.log("Will redirect to:", redirectPath);
    
    // Clear the stored paths before navigation
    localStorage.removeItem('requested_path');
    sessionStorage.removeItem('requested_path');
    localStorage.removeItem('requested_path_time');
    
    // Use a direct window.location approach for more reliable navigation
    setTimeout(() => {
      try {
        console.log("Navigating via React Router to:", redirectPath);
        navigate(redirectPath);
        
        // Add a backup direct navigation in case the React Router navigation fails
        setTimeout(() => {
          if (window.location.pathname.includes('process-repository')) {
            console.log("Still on processing page after navigation attempt, using direct location change");
            window.location.href = redirectPath;
          }
        }, 500);
      } catch (navError) {
        console.error("Navigation failed:", navError);
        console.log("Fallback: Using direct location change to:", redirectPath);
        window.location.href = redirectPath;
      }
    }, 1000);
  } else {
    // Handle error case
    if (processingError) {
      console.error("Processing error:", processingError);
      setError(processingError.toString());
    }
    
    // Navigate to repositories page in case of failure
    console.log("Processing failed, redirecting to repositories page");
    setTimeout(() => {
      navigate('/settings/repositories');
    }, 1000);
  }
};

  const handleCancel = () => {
    console.log("Processing cancelled by user");
    navigate('/settings/repositories');
  };

  if (isInitializing) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Initializing repository processing...</Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <button onClick={() => navigate('/settings/repositories')}>
            Return to Repositories
          </button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <RepositoryProcessing 
          repoFullName={decodeURIComponent(repoFullName)}
          onProcessingComplete={handleProcessingComplete}
          onCancel={handleCancel}
        />
      </Box>
    </Container>
  );
};

export default ProcessRepository;