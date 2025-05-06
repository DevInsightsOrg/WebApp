import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';

const RepoContext = createContext(null);

export const useRepo = () => useContext(RepoContext);

export const RepoProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(
    localStorage.getItem('selected_repo') || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState(null);

  // Fetch repositories when authenticated
  useEffect(() => {
    const fetchRepositories = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        const data = await apiService.getUserRepositories();
        setRepositories(data);
        
        // If no repo is selected but repos exist, select the first one
        if (!selectedRepo && data.length > 0) {
          handleSelectRepo(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, [isAuthenticated]);

  // Fetch last sync date for selected repo
  useEffect(() => {
    const fetchLastSyncDate = async () => {
      if (!selectedRepo) return;
      
      try {
        const data = await apiService.getRepositoryLastSync(selectedRepo);
        setLastSyncDate(data.lastSyncDate);
      } catch (error) {
        console.error('Failed to fetch last sync date:', error);
      }
    };

    fetchLastSyncDate();
  }, [selectedRepo]);

  const handleSelectRepo = (repoId) => {
    setSelectedRepo(repoId);
    localStorage.setItem('selected_repo', repoId);
  };

  const syncRepository = async () => {
    if (!selectedRepo) return;
    
    setIsLoading(true);
    try {
      const data = await apiService.syncRepository(selectedRepo);
      setLastSyncDate(data.lastSyncDate);
      return true;
    } catch (error) {
      console.error('Repository sync failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RepoContext.Provider
      value={{
        repositories,
        selectedRepo,
        lastSyncDate,
        isLoading,
        selectRepository: handleSelectRepo,
        syncRepository
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};