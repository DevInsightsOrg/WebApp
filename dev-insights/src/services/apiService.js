import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mock data for development
const mockData = {
  // Mock user data
  user: {
    id: 'user-1',
    name: 'John Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1234567',
  },
  
  // Mock repositories
  repositories: [
    {
      id: 'repo-1',
      name: 'frontend-project',
      description: 'A React frontend application',
      language: 'JavaScript',
      isPrivate: false,
      lastSyncDate: new Date().toISOString(),
    },
    {
      id: 'repo-2',
      name: 'backend-api',
      description: 'API server written in Python',
      language: 'Python',
      isPrivate: true,
      lastSyncDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'repo-3',
      name: 'mobile-app',
      description: 'React Native mobile application',
      language: 'TypeScript',
      isPrivate: false,
      lastSyncDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  
  // Mock developers
  developers: [
    {
      id: 'dev-1',
      name: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1234567',
      stats: {
        commits: 157,
        pullRequests: 42,
        reviews: 68,
        issues: 23,
      },
      isActive: true,
    },
    {
      id: 'dev-2',
      name: 'Jane Smith',
      username: 'janesmith',
      email: 'jane.smith@example.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/2345678',
      stats: {
        commits: 213,
        pullRequests: 56,
        reviews: 41,
        issues: 35,
      },
      isActive: true,
    },
    {
      id: 'dev-3',
      name: 'Bob Johnson',
      username: 'bobjohnson',
      email: 'bob.johnson@example.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/3456789',
      stats: {
        commits: 98,
        pullRequests: 27,
        reviews: 52,
        issues: 19,
      },
      isActive: true,
    },
  ],
  
  // Mock developer categorization
  developerCategories: {
    connectors: ['dev-1'],
    mavens: ['dev-2'],
    jacks: ['dev-3'],
    totalDevelopers: 3,
    activeDevelopers: 3,
  },
  
  // Mock contribution metrics
  contributionMetrics: {
    contributionsByDeveloper: [
      { name: 'John Doe', commits: 157, prs: 42, reviews: 68, issues: 23 },
      { name: 'Jane Smith', commits: 213, prs: 56, reviews: 41, issues: 35 },
      { name: 'Bob Johnson', commits: 98, prs: 27, reviews: 52, issues: 19 },
    ],
    recentActivity: [
      { 
        developer: 'John Doe', 
        action: 'Added new feature', 
        type: 'commit', 
        description: 'Implement user settings panel', 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() 
      },
      { 
        developer: 'Jane Smith', 
        action: 'Fixed bug', 
        type: 'commit', 
        description: 'Fix authentication token refresh logic', 
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() 
      },
      { 
        developer: 'Bob Johnson', 
        action: 'Reviewed and approved', 
        type: 'pr', 
        description: 'Update dependencies to latest versions', 
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() 
      },
      { 
        developer: 'Jane Smith', 
        action: 'Refactored code', 
        type: 'commit', 
        description: 'Improve performance of data loading', 
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() 
      },
      { 
        developer: 'John Doe', 
        action: 'Added tests', 
        type: 'commit', 
        description: 'Increase test coverage for core components', 
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() 
      },
    ],
  },
  
  // Mock developer profile data
  developerProfiles: {
    'dev-1': {
      id: 'dev-1',
      name: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1234567',
      githubUrl: 'https://github.com/johndoe',
      metrics: {
        codeOwnership: '34%',
        busFactorContribution: '12 files',
        collaborationIndex: '8.7/10',
        impactScore: '84/100',
      },
      contributionHistory: [
        { month: 'Jan', commits: 12, pullRequests: 4, reviews: 7, issues: 2 },
        { month: 'Feb', commits: 15, pullRequests: 3, reviews: 5, issues: 3 },
        { month: 'Mar', commits: 18, pullRequests: 5, reviews: 8, issues: 1 },
        { month: 'Apr', commits: 13, pullRequests: 4, reviews: 6, issues: 2 },
        { month: 'May', commits: 20, pullRequests: 6, reviews: 10, issues: 3 },
        { month: 'Jun', commits: 22, pullRequests: 5, reviews: 9, issues: 4 },
        { month: 'Jul', commits: 17, pullRequests: 4, reviews: 7, issues: 2 },
        { month: 'Aug', commits: 14, pullRequests: 3, reviews: 6, issues: 1 },
        { month: 'Sep', commits: 16, pullRequests: 5, reviews: 5, issues: 3 },
        { month: 'Oct', commits: 10, pullRequests: 3, reviews: 5, issues: 2 },
      ],
      fileContributions: [
        { path: 'src/components/Dashboard.jsx', commits: 24, linesAdded: 456, linesDeleted: 123 },
        { path: 'src/services/apiService.js', commits: 18, linesAdded: 342, linesDeleted: 98 },
        { path: 'src/context/AuthContext.jsx', commits: 15, linesAdded: 278, linesDeleted: 87 },
        { path: 'src/pages/Reports/Heatmap.jsx', commits: 12, linesAdded: 198, linesDeleted: 34 },
        { path: 'src/utils/graphUtils.js', commits: 9, linesAdded: 167, linesDeleted: 45 },
      ],
      collaborators: [
        { id: 'dev-2', name: 'Jane Smith', username: 'janesmith', avatarUrl: 'https://avatars.githubusercontent.com/u/2345678', category: 'maven', collaborationCount: 34 },
        { id: 'dev-3', name: 'Bob Johnson', username: 'bobjohnson', avatarUrl: 'https://avatars.githubusercontent.com/u/3456789', category: 'jack', collaborationCount: 27 },
      ],
    },
    'dev-2': {
      id: 'dev-2',
      name: 'Jane Smith',
      username: 'janesmith',
      email: 'jane.smith@example.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/2345678',
      githubUrl: 'https://github.com/janesmith',
      metrics: {
        codeOwnership: '42%',
        busFactorContribution: '15 files',
        collaborationIndex: '7.2/10',
        impactScore: '91/100',
      },
      contributionHistory: [
        { month: 'Jan', commits: 18, pullRequests: 5, reviews: 4, issues: 3 },
        { month: 'Feb', commits: 22, pullRequests: 6, reviews: 3, issues: 4 },
        { month: 'Mar', commits: 25, pullRequests: 7, reviews: 5, issues: 3 },
        { month: 'Apr', commits: 19, pullRequests: 5, reviews: 4, issues: 4 },
        { month: 'May', commits: 28, pullRequests: 8, reviews: 6, issues: 5 },
        { month: 'Jun', commits: 30, pullRequests: 7, reviews: 4, issues: 6 },
        { month: 'Jul', commits: 24, pullRequests: 6, reviews: 3, issues: 4 },
        { month: 'Aug', commits: 20, pullRequests: 5, reviews: 2, issues: 3 },
        { month: 'Sep', commits: 23, pullRequests: 7, reviews: 4, issues: 3 },
        { month: 'Oct', commits: 18, pullRequests: 4, reviews: 3, issues: 2 },
      ],
      fileContributions: [
        { path: 'src/components/Analytics/Graph.jsx', commits: 32, linesAdded: 567, linesDeleted: 189 },
        { path: 'src/services/graphService.js', commits: 27, linesAdded: 423, linesDeleted: 156 },
        { path: 'src/algorithms/atg.js', commits: 24, linesAdded: 389, linesDeleted: 102 },
        { path: 'src/pages/Reports/ATG.jsx', commits: 19, linesAdded: 312, linesDeleted: 87 },
        { path: 'src/utils/dataProcessing.js', commits: 15, linesAdded: 245, linesDeleted: 67 },
      ],
      collaborators: [
        { id: 'dev-1', name: 'John Doe', username: 'johndoe', avatarUrl: 'https://avatars.githubusercontent.com/u/1234567', category: 'connector', collaborationCount: 34 },
        { id: 'dev-3', name: 'Bob Johnson', username: 'bobjohnson', avatarUrl: 'https://avatars.githubusercontent.com/u/3456789', category: 'jack', collaborationCount: 19 },
      ],
    },
    'dev-3': {
      id: 'dev-3',
      name: 'Bob Johnson',
      username: 'bobjohnson',
      email: 'bob.johnson@example.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/3456789',
      githubUrl: 'https://github.com/bobjohnson',
      metrics: {
        codeOwnership: '24%',
        busFactorContribution: '8 files',
        collaborationIndex: '9.1/10',
        impactScore: '78/100',
      },
      contributionHistory: [
        { month: 'Jan', commits: 10, pullRequests: 3, reviews: 6, issues: 2 },
        { month: 'Feb', commits: 8, pullRequests: 2, reviews: 5, issues: 1 },
        { month: 'Mar', commits: 12, pullRequests: 3, reviews: 7, issues: 2 },
        { month: 'Apr', commits: 9, pullRequests: 2, reviews: 5, issues: 1 },
        { month: 'May', commits: 15, pullRequests: 4, reviews: 8, issues: 3 },
        { month: 'Jun', commits: 16, pullRequests: 3, reviews: 7, issues: 2 },
        { month: 'Jul', commits: 11, pullRequests: 3, reviews: 6, issues: 2 },
        { month: 'Aug', commits: 8, pullRequests: 2, reviews: 4, issues: 1 },
        { month: 'Sep', commits: 9, pullRequests: 3, reviews: 4, issues: 2 },
        { month: 'Oct', commits: 7, pullRequests: 2, reviews: 3, issues: 1 },
      ],
      fileContributions: [
        { path: 'src/components/UI/Charts.jsx', commits: 17, linesAdded: 289, linesDeleted: 78 },
        { path: 'src/styles/theme.js', commits: 14, linesAdded: 207, linesDeleted: 45 },
        { path: 'src/pages/Settings.jsx', commits: 11, linesAdded: 176, linesDeleted: 32 },
        { path: 'src/utils/formatting.js', commits: 9, linesAdded: 134, linesDeleted: 29 },
        { path: 'src/components/Layout/Navigation.jsx', commits: 7, linesAdded: 98, linesDeleted: 23 },
      ],
      collaborators: [
        { id: 'dev-1', name: 'John Doe', username: 'johndoe', avatarUrl: 'https://avatars.githubusercontent.com/u/1234567', category: 'connector', collaborationCount: 27 },
        { id: 'dev-2', name: 'Jane Smith', username: 'janesmith', avatarUrl: 'https://avatars.githubusercontent.com/u/2345678', category: 'maven', collaborationCount: 19 },
      ],
    },
  },
  
  // Mock artifact traceability graph
  atgData: {
    nodes: [
      { id: 'dev-1', type: 'developer', name: 'John Doe' },
      { id: 'dev-2', type: 'developer', name: 'Jane Smith' },
      { id: 'dev-3', type: 'developer', name: 'Bob Johnson' },
      { id: 'src/components/Dashboard.jsx', type: 'file' },
      { id: 'src/services/apiService.js', type: 'file' },
      { id: 'src/context/AuthContext.jsx', type: 'file' },
      { id: 'src/components/Analytics/Graph.jsx', type: 'file' },
      { id: 'src/algorithms/atg.js', type: 'file' },
      { id: 'src/components/UI/Charts.jsx', type: 'file' },
      { id: 'commit-1', type: 'commit' },
      { id: 'commit-2', type: 'commit' },
      { id: 'commit-3', type: 'commit' },
      { id: 'pr-1', type: 'pullRequest', name: 'Add dashboard features' },
      { id: 'pr-2', type: 'pullRequest', name: 'Implement ATG visualization' },
      { id: 'issue-1', type: 'issue', name: 'Authentication bug' },
      { id: 'issue-2', type: 'issue', name: 'Performance optimization' },
    ],
    links: [
      { source: 'dev-1', target: 'commit-1', type: 'authored' },
      { source: 'commit-1', target: 'src/components/Dashboard.jsx', type: 'modified' },
      { source: 'dev-2', target: 'commit-2', type: 'authored' },
      { source: 'commit-2', target: 'src/algorithms/atg.js', type: 'modified' },
      { source: 'dev-3', target: 'commit-3', type: 'authored' },
      { source: 'commit-3', target: 'src/components/UI/Charts.jsx', type: 'modified' },
      { source: 'dev-1', target: 'pr-1', type: 'authored' },
      { source: 'dev-2', target: 'pr-1', type: 'reviewed' },
      { source: 'pr-1', target: 'src/components/Dashboard.jsx', type: 'modified' },
      { source: 'dev-2', target: 'pr-2', type: 'authored' },
      { source: 'dev-3', target: 'pr-2', type: 'reviewed' },
      { source: 'pr-2', target: 'src/components/Analytics/Graph.jsx', type: 'modified' },
      { source: 'dev-1', target: 'issue-1', type: 'created' },
      { source: 'dev-2', target: 'issue-1', type: 'resolved' },
      { source: 'issue-1', target: 'src/context/AuthContext.jsx', type: 'referenced' },
      { source: 'dev-3', target: 'issue-2', type: 'created' },
      { source: 'dev-1', target: 'issue-2', type: 'resolved' },
      { source: 'issue-2', target: 'src/services/apiService.js', type: 'referenced' },
    ],
  },
  
  // Mock heatmap data
  heatmapData: [
    {
      id: 'dev-1',
      name: 'John Doe',
      fileInteractions: [
        { filePath: 'src/components/Dashboard.jsx', interactionCount: 24 },
        { filePath: 'src/services/apiService.js', interactionCount: 18 },
        { filePath: 'src/context/AuthContext.jsx', interactionCount: 15 },
        { filePath: 'src/pages/Reports/Heatmap.jsx', interactionCount: 12 },
        { filePath: 'src/utils/graphUtils.js', interactionCount: 9 },
        { filePath: 'src/components/UI/Button.jsx', interactionCount: 6 },
        { filePath: 'src/pages/Profile.jsx', interactionCount: 5 },
        { filePath: 'public/index.html', interactionCount: 2 },
      ],
    },
    {
      id: 'dev-2',
      name: 'Jane Smith',
      fileInteractions: [
        { filePath: 'src/components/Analytics/Graph.jsx', interactionCount: 32 },
        { filePath: 'src/services/graphService.js', interactionCount: 27 },
        { filePath: 'src/algorithms/atg.js', interactionCount: 24 },
        { filePath: 'src/pages/Reports/ATG.jsx', interactionCount: 19 },
        { filePath: 'src/utils/dataProcessing.js', interactionCount: 15 },
        { filePath: 'src/components/UI/Chart.jsx', interactionCount: 10 },
        { filePath: 'src/pages/Dashboard.jsx', interactionCount: 8 },
        { filePath: 'src/styles/charts.css', interactionCount: 4 },
      ],
    },
    {
      id: 'dev-3',
      name: 'Bob Johnson',
      fileInteractions: [
        { filePath: 'src/components/UI/Charts.jsx', interactionCount: 17 },
        { filePath: 'src/styles/theme.js', interactionCount: 14 },
        { filePath: 'src/pages/Settings.jsx', interactionCount: 11 },
        { filePath: 'src/utils/formatting.js', interactionCount: 9 },
        { filePath: 'src/components/Layout/Navigation.jsx', interactionCount: 7 },
        { filePath: 'src/components/UI/Table.jsx', interactionCount: 6 },
        { filePath: 'src/pages/Login.jsx', interactionCount: 5 },
        { filePath: 'src/styles/global.css', interactionCount: 3 },
      ],
    },
  ],
  
  // Mock bus factor analysis
  busFactorData: {
    overallBusFactor: 2.4,
    highRiskFiles: [
      { path: 'src/algorithms/atg.js', owner: 'Jane Smith', busFactor: 1.2 },
      { path: 'src/services/apiService.js', owner: 'John Doe', busFactor: 1.3 },
      { path: 'src/components/Analytics/Graph.jsx', owner: 'Jane Smith', busFactor: 1.4 },
    ],
    moduleRisks: [
      { module: 'src/algorithms', busFactor: 1.5, owner: 'Jane Smith' },
      { module: 'src/services', busFactor: 1.7, owner: 'John Doe' },
      { module: 'src/context', busFactor: 1.9, owner: 'John Doe' },
    ],
  },
};

// API service object with methods for different endpoints
const apiService = {
  // Auth endpoints
  exchangeCodeForToken: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful authentication
    localStorage.setItem('auth_token', 'mock_token_' + Date.now());
    
    return {
      token: 'mock_token_' + Date.now(),
      user: mockData.user
    };
    
    // Original API call
    // const response = await api.post('/auth/github/callback', { code });
    // return response.data;
  },
  
  validateToken: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock user data
    return {
      user: mockData.user
    };
    
    // Original API call
    // const response = await api.get('/auth/validate');
    // return response.data;
  },
  
  // Repository endpoints
  getUserRepositories: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Return mock repositories
    return mockData.repositories;
    
    // Original API call
    // const response = await api.get('/repositories');
    // return response.data;
  },
  
  getRepositoryDetails: async (repoId) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock repository details
    return mockData.repositories.find(repo => repo.id === repoId) || null;
    
    // Original API call
    // const response = await api.get(`/repositories/${repoId}`);
    // return response.data;
  },
  
  getRepositoryLastSync: async (repoId) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find repository and return last sync date
    const repo = mockData.repositories.find(repo => repo.id === repoId);
    return {
      lastSyncDate: repo ? repo.lastSyncDate : null
    };
    
    // Original API call
    // const response = await api.get(`/repositories/${repoId}/sync`);
    // return response.data;
  },
  
  syncRepository: async (repoId) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update repository last sync date
    const repo = mockData.repositories.find(repo => repo.id === repoId);
    if (repo) {
      repo.lastSyncDate = new Date().toISOString();
    }
    
    return {
      lastSyncDate: repo ? repo.lastSyncDate : null
    };
    
    // Original API call
    // const response = await api.post(`/repositories/${repoId}/sync`);
    // return response.data;
  },
  
  // Developer endpoints
  getDevelopers: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return mock developers
    return mockData.developers;
    
    // Original API call
    // const response = await api.get(`/repositories/${repoId}/developers`, { params });
    // return response.data;
  },
  
  getDeveloperProfile: async (repoId, developerId) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock developer profile
    return mockData.developerProfiles[developerId] || null;
    
    // Original API call
    // const response = await api.get(`/repositories/${repoId}/developers/${developerId}`);
    // return response.data;
  },
  
  // Analytics endpoints
  getDeveloperCategorization: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Return mock developer categorization
    return mockData.developerCategories;
    
    // Original API call
    // const response = await api.get(`/repositories/${repoId}/analytics/developer-types`, { params });
    // return response.data;
  },
  
  getContributionMetrics: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Return mock contribution metrics
    return mockData.contributionMetrics;
    
    // Original API call
    // const response = await api.get(`/repositories/${repoId}/analytics/contributions`, { params });
    // return response.data;
  },
  
  getArtifactTraceabilityGraph: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Return mock ATG data
    return mockData.atgData;
    
    // Original API call
    // const response = await api.get(`/repositories/${repoId}/analytics/atg`, { params });
    // return response.data;
  },
  
  getDeveloperHeatmap: async (repoId, params = {}) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter heatmap data by developer ID if specified
    let heatmap = [...mockData.heatmapData];
    if (params.developerId) {
      heatmap = heatmap.filter(dev => dev.id === params.developerId);
    }
    
    return heatmap;
    
    // Original API call
    // const response = await api.get(`/repositories/${repoId}/analytics/heatmap`, { params });
    // return response.data;
  },

  getBusFactorAnalysis: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock bus factor analysis
    return mockData.busFactorData;
    
    // Original API call
    // const response = await api.get(`/repositories/${repoId}/analytics/bus-factor`, { params });
    // return response.data;
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
      const newRepo = {
        ...availableRepo,
        id: availableRepo.id.replace('gh-repo-', 'repo-'),
        lastSyncDate: new Date().toISOString()
      };
      
      // Add to mock repositories list if not already present
      if (!mockData.repositories.some(r => r.id === newRepo.id)) {
        mockData.repositories.push(newRepo);
      }
    }
    
    return { success: true };
  },
  
  disconnectRepository: async (repoId) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Remove repository from connected repositories
    const index = mockData.repositories.findIndex(repo => repo.id === repoId);
    if (index !== -1) {
      mockData.repositories.splice(index, 1);
    }
    
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