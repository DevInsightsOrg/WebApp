import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';

const RepoContext = createContext(null);

export const useRepo = () => useContext(RepoContext);

export const RepoProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [repositories, setRepositories] = useState([]);
  
  // Initialize from localStorage, but will be null if not stored
  const [selectedRepo, setSelectedRepo] = useState(
    localStorage.getItem('selected_repo') || null
  );
  const [selectedRepoFullName, setSelectedRepoFullName] = useState(
    localStorage.getItem('selected_repo_full_name') || null
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [repositoryStatus, setRepositoryStatus] = useState({
    exists: false,
    isProcessed: false,
    fileCount: 0,
    commitCount: 0,
    developerCount: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch repositories when authenticated
  useEffect(() => {
    const fetchRepositories = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        console.time('fetch-repositories');
        const data = await apiService.getUserRepositories();
        console.timeEnd('fetch-repositories');
        setRepositories(data);
        
        // REMOVED: Auto-selection of first repository
        
        // Only update stored repo if it exists in the fetched repositories
        if (selectedRepo) {
          const repo = data.find(r => r.id === selectedRepo);
          if (repo) {
            // Update fullName if it has changed
            if (repo.fullName !== selectedRepoFullName) {
              setSelectedRepoFullName(repo.fullName);
              localStorage.setItem('selected_repo_full_name', repo.fullName);
            }
          } else {
            // Selected repo no longer exists in the list, clear selection
            handleClearSelection();
          }
        }
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, [isAuthenticated]);

  // Check repository status when repository changes
  useEffect(() => {
    const checkStatus = async () => {
      if (selectedRepoFullName) {
        await checkSelectedRepoStatus();
      } else {
        // Reset status when no repository is selected
        setRepositoryStatus({
          exists: false,
          isProcessed: false,
          fileCount: 0,
          commitCount: 0,
          developerCount: 0
        });
      }
    };
    
    checkStatus();
  }, [selectedRepoFullName]);

  const handleSelectRepo = (repoId, repoFullName) => {
    if (!repoId || !repoFullName) {
      console.warn('Tried to select repository with invalid ID or fullName');
      return;
    }
    
    setSelectedRepo(repoId);
    setSelectedRepoFullName(repoFullName);
    localStorage.setItem('selected_repo', repoId);
    localStorage.setItem('selected_repo_full_name', repoFullName);
  };
  
  const handleClearSelection = () => {
    setSelectedRepo(null);
    setSelectedRepoFullName(null);
    localStorage.removeItem('selected_repo');
    localStorage.removeItem('selected_repo_full_name');
  };

  const checkSelectedRepoStatus = async () => {
    if (!selectedRepoFullName) return;
    
    try {
      // Don't set isLoading here to avoid UI jitter for automatic checks
      console.time('check-repo-status');
      const status = await apiService.checkRepositoryStatus(selectedRepoFullName);
      console.timeEnd('check-repo-status');
      setRepositoryStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check repository status:', error);
      setRepositoryStatus({
        exists: false,
        isProcessed: false,
        fileCount: 0,
        commitCount: 0,
        developerCount: 0
      });
      return { exists: false, isProcessed: false };
    }
  };

  // const processRepository = async () => {
  //   if (!selectedRepoFullName) return;
    
  //   try {
  //     setIsProcessing(true);
      
  //     // Process repository commits
  //     await apiService.fetchRepositoryCommits(selectedRepoFullName);
      
  //     // After processing, refresh repository status
  //     await checkSelectedRepoStatus();
      
  //     return true;
  //   } catch (error) {
  //     console.error('Repository processing failed:', error);
  //     return false;
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // In RepoContext.jsx - update the processRepository method
// In RepoContext.jsx - update the processRepository method
const processRepository = async (repoFullName) => {
  // Use the provided repoFullName or the selected one
  const fullName = repoFullName || selectedRepoFullName;
  
  if (!fullName) {
    console.error("No repository specified for processing");
    throw new Error("No repository specified for processing");
  }
  
  try {
    setIsProcessing(true);
    console.log(`Processing repository: ${fullName}`);
    
    // Process the repository commits
    await apiService.fetchRepositoryCommits(fullName);
    
    // Don't immediately return success - check status first
    console.log(`Repository processing request sent for ${fullName}, checking status...`);
    
    // Do an immediate status check
    const initialStatus = await apiService.checkRepositoryStatus(fullName);
    console.log(`Initial status check for ${fullName}:`, initialStatus);
    
    // If repository is already processed, we can return success immediately
    if (initialStatus.isProcessed) {
      console.log(`Repository ${fullName} is already processed`);
      // Refresh repository status in the context
      setRepositoryStatus(initialStatus);
      return true;
    }
    
    // Add a second status check after a delay to give the backend time to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    const secondStatus = await apiService.checkRepositoryStatus(fullName);
    console.log(`Second status check for ${fullName}:`, secondStatus);
    
    if (secondStatus.isProcessed) {
      console.log(`Repository ${fullName} is now processed`);
      setRepositoryStatus(secondStatus);
      return true;
    }
    
    // If still not processed, let polling handle it
    console.log(`Repository ${fullName} processing initiated, status will be checked via polling`);
    return true;
    
  } catch (error) {
    console.error('Repository processing failed:', error);
    throw error; // Re-throw to allow proper error handling
  } finally {
    setIsProcessing(false);
  }
};

  const getRepositoryById = (repoId) => {
    return repositories.find(repo => repo.id === repoId);
  };

  const getRepositoryByFullName = (fullName) => {
    return repositories.find(repo => repo.fullName === fullName);
  };

  return (
    <RepoContext.Provider
      value={{
        repositories,
        selectedRepo,
        selectedRepoFullName,
        isLoading,
        isProcessing,
        repositoryStatus,
        selectRepository: handleSelectRepo,
        clearSelectedRepository: handleClearSelection,
        processRepository,
        checkSelectedRepoStatus,
        getRepositoryById,
        getRepositoryByFullName
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};