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

//   fetchRepositoryCommits: async (repoFullName, branch = 'main', limit = 10) => {
//   const requestKey = `commits_${repoFullName}_${branch}_${limit}`;
  
//   // If this exact request is already in progress, return the existing promise
//   if (pendingRequests[requestKey]) {
//     console.log(`Reusing pending request for ${requestKey}`);
//     return pendingRequests[requestKey];
//   }
  
//   // Create a new promise with timeout
//   const fetchPromise = (async () => {
//     try {
//       console.log(`Fetching commits for ${repoFullName}`);
      
//       // Set a longer timeout for this API call since it can take time
//       const response = await api.get(`/commits?repo=${repoFullName}&branch=${branch}&limit=${limit}`, {
//         timeout: 120000 // 2-minute timeout since this can be a long operation
//       });
      
//       console.log(`Received ${response.data.commits?.length || 0} commits for ${repoFullName}`);
//       return response.data;
//     } catch (error) {
//       console.error(`Error fetching repository commits for ${repoFullName}:`, error);
      
//       // Add more detailed error logging
//       if (error.response) {
//         console.error(`Status: ${error.response.status}, Data:`, error.response.data);
//       } else if (error.request) {
//         console.error('No response received from server');
//       } else {
//         console.error('Error setting up request:', error.message);
//       }
      
//       throw error;
//     }
//   })();
  
//   // Store the promise in the pendingRequests
//   pendingRequests[requestKey] = fetchPromise;
  
//   try {
//     // Wait for the promise to resolve or reject
//     return await fetchPromise;
//   } finally {
//     // Clean up after request completes (success or error)
//     // Use setTimeout to ensure we don't delete too early during the event loop
//     setTimeout(() => {
//       delete pendingRequests[requestKey];
//     }, 0);
//   }
// },

// checkRepositoryStatus: async (repoFullName) => {
//   try {
//     // Use your new debug endpoint to check if repository exists in the database
//     const [owner, repo] = repoFullName.split('/');
//     const response = await api.get(`/api/debug/repo/${owner}/${repo}`);
    
//     // Consider repository as processed if it has files and commits
//     const isProcessed = 
//       response.data.repository_exists && 
//       response.data.file_count > 0 && 
//       response.data.commit_count > 0;
      
//     return {
//       exists: response.data.repository_exists,
//       isProcessed,
//       fileCount: response.data.file_count,
//       commitCount: response.data.commit_count,
//       developerCount: response.data.developer_count
//     };
//   } catch (error) {
//     // If the endpoint returns 404, the repository doesn't exist
//     if (error.response && error.response.status === 404) {
//       return { exists: false, isProcessed: false };
//     }
//     console.error('Error checking repository status:', error);
//     throw error;
//   }
// },

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
fetchRepositoryCommits: async (repoFullName, branch = 'main', limit = 100) => {
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
  
  // getRepositoryDetails: async (repoId) => {
  //   // Simulate API call delay
  //   await new Promise(resolve => setTimeout(resolve, 500));
    
  //   // Return mock repository details
  //   return mockData.repositories.find(repo => repo.id === repoId) || null;
    
  //   // Original API call
  //   // const response = await api.get(`/repositories/${repoId}`);
  //   // return response.data;
  // },
  
  // getRepositoryLastSync: async (repoId) => {
  //   // Simulate API call delay
  //   await new Promise(resolve => setTimeout(resolve, 300));
    
  //   // Find repository and return last sync date
  //   const repo = mockData.repositories.find(repo => repo.id === repoId);
  //   return {
  //     lastSyncDate: repo ? repo.lastSyncDate : null
  //   };
    
  //   // Original API call
  //   // const response = await api.get(`/repositories/${repoId}/sync`);
  //   // return response.data;
  // },
  
  // syncRepository: async (repoId) => {
  //   // Simulate API call delay
  //   await new Promise(resolve => setTimeout(resolve, 1500));
    
  //   // Update repository last sync date
  //   const repo = mockData.repositories.find(repo => repo.id === repoId);
  //   if (repo) {
  //     repo.lastSyncDate = new Date().toISOString();
  //   }
    
  //   return {
  //     lastSyncDate: repo ? repo.lastSyncDate : null
  //   };
    
  //   // Original API call
  //   // const response = await api.post(`/repositories/${repoId}/sync`);
  //   // return response.data;
  // },
  
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
  
  // Analytics endpoints
  getDeveloperCategorization: async () => {
    try {
      const response = await api.get('/analytics/developer-categorization');
      return response.data;
    } catch (error) {
      console.error('Error fetching developer categorization:', error);
      console.log('Falling back to mock data');
      // Return mock data as fallback
      //return mockData.developerCategories;
    }
  },
  
  getContributionMetrics: async () => {
    try {
      const response = await api.get('/analytics/contribution-metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching contribution metrics:', error);
      console.log('Falling back to mock data');
      // Return mock data as fallback
      //return mockData.contributionMetrics;
    }
  },
  
  getArtifactTraceabilityGraph: async () => {
    try {
      const response = await api.get('/analytics/artifact-traceability-graph');
      return response.data;
    } catch (error) {
      console.error('Error fetching ATG data:', error);
      console.log('Falling back to mock data');
      // Return mock data as fallback
      //return mockData.atgData;
    }
  },
  
  getDeveloperHeatmap: async (repoId, params = {}) => {
    try {
      const queryParams = params.developerId ? `?developer_id=${params.developerId}` : '';
      const response = await api.get(`/analytics/developer-heatmap${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      console.log('Falling back to mock data');
      // Filter mock data based on developer ID if specified
      //let heatmap = [...mockData.heatmapData];
      //if (params.developerId) {
      //  heatmap = heatmap.filter(dev => dev.id === params.developerId);
      //}
      //return heatmap;
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
  },
  
  // Additional mock methods for GitHub connection
  getAvailableGitHubRepositories: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Return mock available repositories
    return [
      {
        id: 'gh-repo-1',
        name: 'frontend-project',
        description: 'A React frontend application',
        language: 'JavaScript',
        isPrivate: false,
      },
      {
        id: 'gh-repo-2',
        name: 'backend-api',
        description: 'API server written in Python',
        language: 'Python',
        isPrivate: true,
      },
      {
        id: 'gh-repo-3',
        name: 'mobile-app',
        description: 'React Native mobile application',
        language: 'TypeScript',
        isPrivate: false,
      },
      {
        id: 'gh-repo-4',
        name: 'data-analysis',
        description: 'Data analysis scripts and notebooks',
        language: 'Python',
        isPrivate: false,
      },
      {
        id: 'gh-repo-5',
        name: 'design-system',
        description: 'UI component library',
        language: 'TypeScript',
        isPrivate: false,
      },
    ];
  },
  
  connectRepository: async (repoId) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add repository to connected repositories
    const availableRepo = [
      {
        id: 'gh-repo-1',
        name: 'frontend-project',
        description: 'A React frontend application',
        language: 'JavaScript',
        isPrivate: false,
      },
      {
        id: 'gh-repo-2',
        name: 'backend-api',
        description: 'API server written in Python',
        language: 'Python',
        isPrivate: true,
      },
      {
        id: 'gh-repo-3',
        name: 'mobile-app',
        description: 'React Native mobile application',
        language: 'TypeScript',
        isPrivate: false,
      },
      {
        id: 'gh-repo-4',
        name: 'data-analysis',
        description: 'Data analysis scripts and notebooks',
        language: 'Python',
        isPrivate: false,
      },
      {
        id: 'gh-repo-5',
        name: 'design-system',
        description: 'UI component library',
        language: 'TypeScript',
        isPrivate: false,
      },
    ].find(repo => repo.id === repoId);
    
    if (availableRepo) {
      //const newRepo = {
      //  ...availableRepo,
      //  id: availableRepo.id.replace('gh-repo-', 'repo-'),
      //  lastSyncDate: new Date().toISOString()
      //};
      
      // Add to mock repositories list if not already present
      //if (!mockData.repositories.some(r => r.id === newRepo.id)) {
      //  mockData.repositories.push(newRepo);
      //}
    }
    
    return { success: true };
  },
  
  disconnectRepository: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Remove repository from connected repositories
    //const index = mockData.repositories.findIndex(repo => repo.id === repoId);
    //if (index !== -1) {
    //  mockData.repositories.splice(index, 1);
    //}
    
    return { success: true };
  },
  
  // User settings methods
  updateUserSettings: async (settings) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return success
    return { success: true, settings };
  },
  
  // Repository settings methods
  updateRepositorySettings: async (repoId, settings) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Return success
    return { success: true, repoId, settings };
  }
};

export default apiService;