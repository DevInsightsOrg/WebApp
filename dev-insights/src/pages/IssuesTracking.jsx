import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  BugReport as BugIcon,
  Lightbulb as FeatureIcon,
  Description as DocumentationIcon,
  Build as EnhancementIcon,
  HelpOutline as OtherIcon,
  GitHub as GitHubIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MergeType as PullRequestIcon
} from '@mui/icons-material';
import { useRepo } from '../context/RepoContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Define colors for issue categories
const CATEGORY_COLORS = {
  'Bugs': '#f44336',
  'Features': '#ff9800',
  'Documentation': '#ffeb3b',
  'Enhancements': '#4caf50',
  'Other': '#9e9e9e'
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {name} ({`${(percent * 100).toFixed(0)}%`})
    </text>
  );
};

const IssuesTracking = () => {
  const navigate = useNavigate();
  const { selectedRepo, repositories } = useRepo();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    repository_name: "",
    repository_description: null,
    issues: {
      total: 0,
      open: 0,
      closed: 0,
      resolution_rate: 0,
      avg_resolution_time: 0,
      categories: {},
      top_solvers: [],
      change_vs_previous: { percentage: 0, direction: "decrease" }
    },
    pull_requests: {
      total: 0,
      open: 0,
      closed: 0,
      completion_rate: 0,
      avg_completion_time: 0,
      top_reviewers: [],
      change_vs_previous: { percentage: 0, direction: "decrease" }
    },
    historical_data: []
  });
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    repoState: null,
    apiAttempted: false,
    repoName: null
  });
  const [activeTab, setActiveTab] = useState(0);

  const [repoInfo, setRepoInfo] = useState({
    owner: null,
    repo: null
  });
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Get repository name from ID
  useEffect(() => {
    const getRepoInfo = async () => {
      setLoading(true);
      
      try {
        // Find the selected repository in the repositories list
        const selectedRepoData = repositories.find(repo => repo.id === selectedRepo);
        
        if (selectedRepoData && selectedRepoData.fullName) {
          console.log("Found repository:", selectedRepoData);
          
          let owner = null;
          let repoName = null;
          
          console.log("Selected repository data", selectedRepoData);
          // Extract owner and repo name from the repository name (should be in format owner/repo)
          if (selectedRepoData.fullName.includes('/')) {
            [owner, repoName] = selectedRepoData.fullName.split('/');
          } else {
            // If repo name doesn't contain a slash, try to use another approach
            // Use the user's name as owner if available, or fall back to a default
            owner = "";
            repoName = selectedRepoData.name;
          }
          
          console.log("Extracted owner/repo:", owner, repoName);
          
          setRepoInfo({ owner, repo: repoName });
          setDebugInfo(prev => ({
            ...prev,
            repoState: owner && repoName ? `${owner}/${repoName}` : 'Invalid repo format',
            repoName: selectedRepoData.name
          }));
          
        } else if (selectedRepo) {
          // If we only have ID but no repository data, try to fetch it
          try {
            const repoDetails = await apiService.getRepositoryDetails(selectedRepo);
            
            if (repoDetails && repoDetails.name) {
              let owner = null;
              let repoName = null;
              
              if (repoDetails.name.includes('/')) {
                [owner, repoName] = repoDetails.name.split('/');
              } else {
                owner = user?.name || "ecebeyhan";
                repoName = repoDetails.name;
              }
              
              console.log("Fetched repository details:", repoDetails);
              console.log("Extracted owner/repo from details:", owner, repoName);
              
              setRepoInfo({ owner, repo: repoName });
              setDebugInfo(prev => ({
                ...prev,
                repoState: owner && repoName ? `${owner}/${repoName}` : 'Invalid repo format',
                repoName: repoDetails.name
              }));
            } else {
              setError("Could not find repository details");
              setLoading(false);
            }
          } catch (err) {
            console.error("Error fetching repository details:", err);
            setError("Failed to fetch repository details");
            setLoading(false);
          }
        } else {
          // No selected repository
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in getRepoInfo:", err);
        setError("Failed to process repository information");
        setLoading(false);
      }
    };
    
    getRepoInfo();
  }, [selectedRepo, repositories, user]);

  const setManualRepo = () => {
    const testOwner = "facebook";
    const testRepo = "react";
    
    console.log("Manual test repository set:", `${testOwner}/${testRepo}`);
    setRepoInfo({ owner: testOwner, repo: testRepo });
    
    setDebugInfo(prev => ({
      ...prev,
      repoState: `${testOwner}/${testRepo}`,
      repoName: `${testOwner}/${testRepo}`
    }));
    
    fetchIssuesData(testOwner, testRepo);
  };

  // Fetch issues data from API
  const fetchIssuesData = async (ownerParam, repoParam) => {
    if (!ownerParam || !repoParam) {
      console.log("Cannot fetch: missing owner or repo parameters");
      setLoading(false);
      return;
    }

    setDebugInfo(prev => ({...prev, apiAttempted: true}));

    try {
      setLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      console.log("Using API URL:", apiUrl);
      
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const fullUrl = `${apiUrl}/api/repos/${ownerParam}/${repoParam}/issues-analysis`;
      console.log("Fetching issues analysis from:", fullUrl);
      
      const response = await axios.get(fullUrl, { headers });
      
      console.log("API response received:", response.status);
      console.log("Response data:", response.data);
      
      // Make sure we actually set the data
      if (response.data) {
        setData(response.data);
        // Clear any previous errors since we got valid data
        setError(null);
      } else {
        setError("Received empty response from server");
      }
    } catch (err) {
      console.error("API error details:", err);
      setError(err.response?.data?.detail || `Failed to fetch issues data: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Add this function to check if we have actual data to display
  const hasValidData = () => {
    return data && 
      (data.issues?.total !== undefined || 
       data.pull_requests?.total !== undefined || 
       (data.historical_data && data.historical_data.length > 0));
  };

  // Fetch data when repo info changes
  useEffect(() => {
    const { owner, repo } = repoInfo;
    
    if (owner && repo) {
      fetchIssuesData(owner, repo);
    } else {
      setLoading(false);
    }
  }, [repoInfo.owner, repoInfo.repo]);

  const handleRefresh = () => {
    setRefreshing(true);
    const { owner, repo } = repoInfo;
    if (owner && repo) {
      fetchIssuesData(owner, repo);
    } else {
      setRefreshing(false);
    }
  };

  // Convert issue categories to chart data format
  const getCategoryChartData = () => {
    if (!data.issues?.categories) return [];
    
    return Object.entries(data.issues.categories).map(([name, details]) => ({
      name,
      value: details.count
    }));
  };

  const { owner, repo } = repoInfo;

  if (!owner || !repo) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Issues & Pull Requests Tracking
          </Typography>
        </Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No valid repository selected. The repository format should be "owner/repo".
        </Alert>
        <Button 
          variant="contained" 
          onClick={setManualRepo}
          sx={{ mt: 2, mr: 2 }}
        >
          Use Test Repository (Facebook/React)
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/settings/repositories')}
          sx={{ mt: 2 }}
        >
          Go to Repository Settings
        </Button>
      </Container>
    );
  }

  if (loading && !refreshing) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Issues & Pull Requests Tracking
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Loading data for {owner}/{repo}...
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !hasValidData()) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Issues & Pull Requests Tracking
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Repository: {owner}/{repo}
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Retry
        </Button>
      </Container>
    );
  }

  // Create trend indicator component
  const TrendIndicator = ({ change }) => {
    if (!change) return null;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
        {change.direction === 'increase' ? (
          <TrendingUpIcon fontSize="small" color="error" />
        ) : (
          <TrendingDownIcon fontSize="small" color="success" />
        )}
        <Typography variant="caption" color={change.direction === 'increase' ? 'error.main' : 'success.main'}>
          {Math.abs(change.percentage)}%
        </Typography>
      </Box>
    );
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Bugs': return <BugIcon />;
      case 'Features': return <FeatureIcon />;
      case 'Documentation': return <DocumentationIcon />;
      case 'Enhancements': return <EnhancementIcon />;
      default: return <OtherIcon />;
    }
  };

  // Ensure we have the expected data format
  const { issues, pull_requests, historical_data, repository_name } = data;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Issues & Pull Requests Tracking
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Analysis and metrics for {repository_name || `${owner}/${repo}`}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          <GitHubIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {repository_name || `${owner}/${repo}`}
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>
      
      {refreshing && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ mr: 1 }} /> 
          <Typography variant="body2">Refreshing data...</Typography>
        </Box>
      )}

      {/* Tab navigation */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label="Issues" />
          <Tab label="Pull Requests" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Issues Overview" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Total Issues
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h4">
                            {issues?.total || 0}
                          </Typography>
                          <TrendIndicator change={issues?.change_vs_previous} />
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Resolution Rate
                        </Typography>
                        <Typography variant="h4">
                          {issues?.resolution_rate || 0}%
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Pull Requests Overview" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Total PRs
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h4">
                            {pull_requests?.total || 0}
                          </Typography>
                          <TrendIndicator change={pull_requests?.change_vs_previous} />
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Completion Rate
                        </Typography>
                        <Typography variant="h4">
                          {pull_requests?.completion_rate || 0}%
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Historical Data Chart */}
          <Card sx={{ mb: 4 }}>
            <CardHeader title="Historical Activity" />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={historical_data || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="issues_created" 
                    name="Issues Created" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="issues_resolved" 
                    name="Issues Resolved" 
                    stroke="#82ca9d" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="prs_created" 
                    name="PRs Created" 
                    stroke="#ff7300" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="prs_closed" 
                    name="PRs Closed" 
                    stroke="#ffc658" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Contributors Overview */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Top Issue Solvers" />
                <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <List>
                    {issues?.top_solvers && issues.top_solvers.length > 0 ? (
                      issues.top_solvers.map((solver, index) => (
                        <ListItem key={solver.username} divider={index < issues.top_solvers.length - 1}>
                          <ListItemAvatar>
                            <Avatar src={solver.avatar_url}>
                              {solver.username ? solver.username.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={solver.username}
                            secondary={`${solver.issues_resolved} issues resolved`}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary" align="center">
                        No solver data available.
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Top PR Reviewers" />
                <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <List>
                    {pull_requests?.top_reviewers && pull_requests.top_reviewers.length > 0 ? (
                      pull_requests.top_reviewers.map((reviewer, index) => (
                        <ListItem key={reviewer.username} divider={index < pull_requests.top_reviewers.length - 1}>
                          <ListItemAvatar>
                            <Avatar src={reviewer.avatar_url}>
                              {reviewer.username ? reviewer.username.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={reviewer.username}
                            secondary={`${reviewer.prs_reviewed} PRs reviewed`}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary" align="center">
                        No reviewer data available.
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Issues Tab */}
      {activeTab === 1 && (
        <>
          {/* Issue Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total Issues
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h4">
                    {issues?.total || 0}
                  </Typography>
                  <TrendIndicator change={issues?.change_vs_previous} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Open Issues
                </Typography>
                <Typography variant="h4">
                  {issues?.open || 0}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Resolution Rate
                </Typography>
                <Typography variant="h4">
                  {issues?.resolution_rate || 0}%
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Avg. Resolution Time
                </Typography>
                <Typography variant="h4">
                  {issues?.avg_resolution_time || 0}d
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Issue Creation vs Resolution Chart */}
          <Card sx={{ mb: 4 }}>
            <CardHeader title="Issue Creation vs Resolution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={historical_data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={1}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="issues_created" 
                    name="Issues Created" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="issues_resolved" 
                    name="Issues Resolved" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Issue Categories and Top Solvers */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Issue Categories" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getCategoryChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCategoryChartData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[entry.name] || '#8884d8'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <Box sx={{ mt: 2 }}>
                    {getCategoryChartData().map((category) => (
                      <Chip
                        key={category.name}
                        icon={getCategoryIcon(category.name)}
                        label={`${category.name}: ${category.value}`}
                        sx={{ 
                          mr: 1, 
                          mb: 1,
                          bgcolor: `${CATEGORY_COLORS[category.name]}20`,
                          borderColor: CATEGORY_COLORS[category.name],
                          border: '1px solid'
                        }}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Top Issue Solvers" />
                <CardContent>
                  <List>
                    {issues?.top_solvers && issues.top_solvers.length > 0 ? (
                      issues.top_solvers.map((solver, index) => (
                        <ListItem key={solver.username} divider={index < issues.top_solvers.length - 1}>
                          <ListItemAvatar>
                            <Avatar src={solver.avatar_url}>
                              {solver.username ? solver.username.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={solver.username}
                            secondary={`${solver.issues_resolved} issues resolved`}
                            sx={{ width: '60%' }}
                          />
                          <Box sx={{ width: '40%', pl: 2 }}>
                            <Box 
                              sx={{ 
                                height: 16, 
                                width: `${(solver.issues_resolved / (issues.top_solvers[0]?.issues_resolved || 1)) * 100}%`, 
                                backgroundColor: '#4caf50',
                                borderRadius: 1
                              }}
                            />
                          </Box>
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary" align="center">
                        No solver data available.
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Pull Requests Tab */}
      {activeTab === 2 && (
        <>
          {/* PR Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total PRs
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h4">
                    {pull_requests?.total || 0}
                  </Typography>
                  <TrendIndicator change={pull_requests?.change_vs_previous} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Open PRs
                </Typography>
                <Typography variant="h4">
                  {pull_requests?.open || 0}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Completion Rate
                </Typography>
                <Typography variant="h4">
                  {pull_requests?.completion_rate || 0}%
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Avg. Completion Time
                </Typography>
                <Typography variant="h4">
                  {pull_requests?.avg_completion_time || 0}d
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* PR Creation vs Closing Chart */}
          <Card sx={{ mb: 4 }}>
            <CardHeader title="Pull Request Creation vs Closing" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={historical_data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={1}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="prs_created" 
                    name="PRs Created" 
                    stroke="#ff7300" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="prs_closed" 
                    name="PRs Closed" 
                    stroke="#ffc658" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top PR Reviewers */}
          <Card>
            <CardHeader title="Top Pull Request Reviewers" />
            <CardContent>
              <List>
                {pull_requests?.top_reviewers && pull_requests.top_reviewers.length > 0 ? (
                  pull_requests.top_reviewers.map((reviewer, index) => (
                    <ListItem key={reviewer.username} divider={index < pull_requests.top_reviewers.length - 1}>
                      <ListItemAvatar>
                        <Avatar src={reviewer.avatar_url}>
                          {reviewer.username ? reviewer.username.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={reviewer.username}
                        secondary={`${reviewer.prs_reviewed} PRs reviewed`}
                        sx={{ width: '60%' }}
                      />
                      <Box sx={{ width: '40%', pl: 2 }}>
                        <Box 
                          sx={{ 
                            height: 16, 
                            width: `${(reviewer.prs_reviewed / (pull_requests.top_reviewers[0]?.prs_reviewed || 1)) * 100}%`, 
                            backgroundColor: '#ff7300',
                            borderRadius: 1
                          }}
                        />
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center">
                    No reviewer data available.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Related Actions */}
      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/reports/traceability')}
        >
          View Artifact Traceability
        </Button>
        <Button 
          variant="outlined"
          onClick={() => window.open(`https://github.com/${owner}/${repo}/issues`, '_blank')}
          startIcon={<BugIcon />}
        >
          View Issues on GitHub
        </Button>
        <Button 
          variant="outlined"
          onClick={() => window.open(`https://github.com/${owner}/${repo}/pulls`, '_blank')}
          startIcon={<PullRequestIcon />}
        >
          View Pull Requests on GitHub
        </Button>
      </Stack>
    </Container>
  );
};

export default IssuesTracking;