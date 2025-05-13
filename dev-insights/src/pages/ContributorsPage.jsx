import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Grid, 
  Divider, 
  Chip, 
  CircularProgress,
  Stack, 
  Paper,
  Link,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  GitHub as GitHubIcon, 
  StarOutline as StarIcon, 
  ForkRight as ForkIcon, 
  BugReport as IssueIcon,
  Code as CodeIcon,
  Commit as CommitIcon,
  AddCircleOutline as AddedIcon,
  RemoveCircleOutline as RemovedIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useRepo } from '../context/RepoContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

const ContributorsPage = () => {
  const navigate = useNavigate();
  const { selectedRepo, repositories } = useRepo();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    repository_stats: {},
    contributors: [],
    most_modified_files: []
  });
  const [refreshing, setRefreshing] = useState(false);


  const [repoInfo, setRepoInfo] = useState({
    owner: null,
    repo: null
  });
  
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
    
    
    fetchContributorsForRepo(testOwner, testRepo);
  };

  const fetchContributorsForRepo = async (ownerParam, repoParam) => {
    if (!ownerParam || !repoParam) {
      console.log("Cannot fetch: missing owner or repo parameters");
      setLoading(false);
      return;
    }

    
    try {
      setLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      console.log("Using API URL:", apiUrl);
      
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const fullUrl = `${apiUrl}/api/repos/${ownerParam}/${repoParam}/all-contributors`;
      console.log("Making API request to:", fullUrl);
      
      const response = await axios.get(fullUrl, { headers });
      
      console.log("API response received:", response.status);
      setData(response.data);
    } catch (err) {
      console.error("API error details:", err);
      setError(err.response?.data?.detail || `Failed to fetch contributor data: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const { owner, repo } = repoInfo;
    
    if (owner && repo) {
      fetchContributorsForRepo(owner, repo);
    } else {
      setLoading(false);
    }
  }, [repoInfo.owner, repoInfo.repo]);

  const handleRefresh = () => {
    setRefreshing(true);
    const { owner, repo } = repoInfo;
    if (owner && repo) {
      fetchContributorsForRepo(owner, repo);
    } else {
      setRefreshing(false);
    }
  };


  const { owner, repo } = repoInfo;

  if (!owner || !repo) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Code Contribution Analysis
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
            Code Contribution Analysis
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Code Contribution Analysis
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

  const { repository_stats, contributors, most_modified_files } = data;

  // Create trend indicator component for metrics
  const TrendIndicator = ({ change }) => {
    if (!change) return null;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
        {change.direction === 'increase' ? (
          <TrendingUpIcon fontSize="small" color="success" />
        ) : (
          <TrendingDownIcon fontSize="small" color="error" />
        )}
        <Typography variant="caption" color={change.direction === 'increase' ? 'success.main' : 'error.main'}>
          {change.percentage}%
        </Typography>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Code Contribution Analysis
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Detailed contribution statistics for {repository_stats.repository_name || `${owner}/${repo}`}
        </Typography>
      </Box>
      

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          <GitHubIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {repository_stats.repository_name || `${owner}/${repo}`}
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
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {repository_stats.repository_description || "No description available"}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', my: 3 }}>
        <Chip 
          icon={<StarIcon />} 
          label={`${repository_stats.stars || 0} stars`} 
          variant="outlined"
        />
        <Chip 
          icon={<ForkIcon />} 
          label={`${repository_stats.forks || 0} forks`} 
          variant="outlined"
        />
        <Chip 
          icon={<IssueIcon />} 
          label={`${repository_stats.open_issues || 0} open issues`} 
          variant="outlined"
        />
        <Chip 
          icon={<CommitIcon />} 
          label={`${repository_stats.total_commits || 0} commits`} 
          variant="outlined"
        />
        <Chip 
          icon={<CodeIcon />} 
          label={`${repository_stats.files_changed || 0} files changed`} 
          variant="outlined"
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 3, my: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Paper elevation={2} sx={{ p: 2, flex: 1, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>Code Changes</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h4" color="success.main">
                  +{(repository_stats.lines_added || 0).toLocaleString()}
                </Typography>
                <TrendIndicator change={repository_stats.lines_added_change} />
              </Box>
              <Typography variant="body2" color="text.secondary">Lines Added</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h4" color="error.main">
                  -{(repository_stats.lines_removed || 0).toLocaleString()}
                </Typography>
                <TrendIndicator change={repository_stats.lines_removed_change} />
              </Box>
              <Typography variant="body2" color="text.secondary">Lines Removed</Typography>
            </Box>
          </Box>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 2, flex: 1, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>Contributors</Typography>
          <Typography variant="h4">{contributors.length || 0}</Typography>
          <Typography variant="body2" color="text.secondary">
            People who have contributed to this repository
          </Typography>
        </Paper>
      </Box>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
        Top Contributors
      </Typography>
      
      {refreshing && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ mr: 1 }} /> 
          <Typography variant="body2">Refreshing contributor data...</Typography>
        </Box>
      )}
      
      <Grid container spacing={3}>
        {contributors && contributors.length > 0 ? contributors.map((contributor) => (
          <Grid item xs={12} sm={6} md={4} key={contributor.github}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                  <Avatar 
                    src={contributor.avatar_url} 
                    alt={contributor.name || contributor.github} 
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="h6" noWrap>
                      {contributor.name || contributor.github}
                    </Typography>
                    <Link 
                      href={contributor.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      underline="hover"
                      color="text.secondary"
                      sx={{ display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      @{contributor.github}
                    </Link>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Commits:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {contributor.commits}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Files touched:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {contributor.files_touched}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AddedIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">Added:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {contributor.lines_added ? contributor.lines_added.toLocaleString() : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <RemovedIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">Removed:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {contributor.lines_removed ? contributor.lines_removed.toLocaleString() : 'N/A'}
                    </Typography>
                  </Box>
                  
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )) : (
          <Grid item xs={12}>
            <Alert severity="info">
              No contributors data available.
            </Alert>
          </Grid>
        )}
      </Grid>
      
      {/* Most Modified Files Section */}
      {most_modified_files && most_modified_files.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mt: 6, mb: 3, fontWeight: 'medium' }}>
            Most Modified Files
          </Typography>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="most modified files table">
              <TableHead>
                <TableRow>
                  <TableCell>File Path</TableCell>
                  <TableCell>Filename</TableCell>
                  <TableCell align="right">Commits</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {most_modified_files.map((file) => (
                  <TableRow
                    key={file.file_path}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {file.file_path}
                    </TableCell>
                    <TableCell>{file.filename}</TableCell>
                    <TableCell align="right">{file.commits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default ContributorsPage;