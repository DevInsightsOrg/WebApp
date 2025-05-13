import api from './apiConfig';

// API service object with methods for different endpoints
const apiService = {
  
  // Repository endpoints
  getUserRepositories: async () => {
      try {     
        const response = await api.get('/user/repositories');
        
        // You can process the data here if needed
        return response.data.map(repo => ({
            ...repo,
            ownerName: repo.owner.login,
            repoName: repo.name
        }));
      } catch (error) {
          console.error('Error fetching repositories:', error);
          throw error;
      }
  },

checkRepositoryStatus: async (repoFullName) => {
  try {
    // Split the repository full name into owner and repo
    const [owner, repo] = repoFullName.split('/');
    
    // Call the debug endpoint to check repository status
    const response = await api.get(`/api/debug/repo/${owner}/${repo}`);
    
    // A repository is considered "processed" if it exists and has files and commits
    const isProcessed = 
      response.data.repository_exists && 
      response.data.file_count > 0 && 
      response.data.commit_count > 0;
    
    console.log(`Repository ${repoFullName} status:`, {
      exists: response.data.repository_exists,
      isProcessed,
      fileCount: response.data.file_count,
      commitCount: response.data.commit_count,
      developerCount: response.data.developer_count
    });
    
    return {
      exists: response.data.repository_exists,
      isProcessed,
      fileCount: response.data.file_count,
      commitCount: response.data.commit_count,
      developerCount: response.data.developer_count
    };
  } catch (error) {
    console.error('Error checking repository status:', error);
    // If there's an error, assume not processed
    return { exists: false, isProcessed: false };
  }
},

// Update fetchRepositoryCommits method
fetchRepositoryCommits: async (repoFullName, branch = 'main', limit = 10) => {
  // Create a unique request key for deduplication
  const requestKey = `commits_${repoFullName}_${branch}_${limit}`;
  
  // If pendingRequests is not defined, create it
  if (!window.pendingRepositoryRequests) {
    window.pendingRepositoryRequests = {};
  }
  
  // If this exact request is already in progress, return the existing promise
  if (window.pendingRepositoryRequests[requestKey]) {
    console.log(`Reusing pending request for ${requestKey}`);
    return window.pendingRepositoryRequests[requestKey];
  }
  
  // Create a new promise for this request
  const fetchPromise = (async () => {
    try {
      console.log(`Fetching commits for ${repoFullName}`);
      
      // Set a longer timeout for this operation
      const response = await api.get(`/commits?repo=${repoFullName}&branch=${branch}&limit=${limit}`, {
        timeout: 120000 // 2-minute timeout
      });
      
      console.log(`Received response for ${repoFullName} with ${response.data.commits?.length || 0} commits`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching repository commits for ${repoFullName}:`, error);
      
      // Add more detailed error info
      if (error.response) {
        console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      } else if (error.request) {
        console.error('No response received from server');
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      throw error;
    }
  })();
  
  // Store the promise
  window.pendingRepositoryRequests[requestKey] = fetchPromise;
  
  try {
    // Wait for the promise to resolve
    return await fetchPromise;
  } finally {
    // Use setTimeout to prevent deleting too early
    setTimeout(() => {
      delete window.pendingRepositoryRequests[requestKey];
    }, 0);
  }
},

  getDeveloperQualityScores: async (repoFullName) => {
  try {
    // Let Axios handle encoding and parsing
    const response = await api.get('/repo/developer-quality-scores', {
      params: { repo: repoFullName }
    });
    // Axios puts the parsed JSON into response.data
    return response.data;
  } catch (error) {
    console.error('Error fetching developer quality scores:', error);
    throw error;
  }
},  
  // Developer endpoints
  getDevelopers: async () => {
    try {
      const response = await api.get('/analytics/developers');
      return response.data;
    } catch (error) {
      console.error('Error fetching developers:', error);
      console.log('Falling back to mock data');
      // Return mock data as fallback
      //return mockData.developers;
    }
  },
  
  getDeveloperProfile: async (repoId, developerId) => {
    try {
      const response = await api.get(`/analytics/developer/${developerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching developer profile:', error);
      console.log('Falling back to mock data');
      // Return mock data as fallback
      // return mockData.developerProfiles[developerId] || null;
    }
  },
  
  
  getBusFactorAnalysis: async () => {
    try {
      const response = await api.get('/analytics/bus-factor-analysis');
      return response.data;
    } catch (error) {
      console.error('Error fetching bus factor analysis:', error);
      console.log('Falling back to mock data');
      // Return mock data as fallback
      //return mockData.busFactorData;
    }
  }

};

export default apiService;