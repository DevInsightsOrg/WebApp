import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Email as EmailIcon,
  CloudDownload as DownloadIcon,
  Code as CodeIcon,
  AssignmentTurnedIn as TaskIcon,
  Commit as CommitIcon,
  MergeType as MergeIcon,
  AccountTree as AccountTreeIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useRepo } from '../../context/RepoContext';
import apiService from '../../services/apiService';

// Define colors for charts
const CHART_COLORS = {
  commits: '#8884d8',
  pullRequests: '#82ca9d',
  reviews: '#ffc658',
  issues: '#ff8042'
};

// Define colors for developer categories
const DEVELOPER_COLORS = {
  connector: '#8884d8',
  maven: '#82ca9d',
  jack: '#ffc658',
  uncategorized: '#cccccc'
};

const DeveloperProfile = () => {
  const { id } = useParams();
  const { selectedRepo } = useRepo();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [developer, setDeveloper] = useState(null);
  const [contributionHistory, setContributionHistory] = useState([]);
  const [fileContributions, setFileContributions] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // Fetch developer profile data
  useEffect(() => {
    const fetchDeveloperProfile = async () => {
      if (!selectedRepo || !id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch developer profile
        const profileData = await apiService.getDeveloperProfile(selectedRepo, id);
        
        // Fetch developer categorization to determine the category
        const categorization = await apiService.getDeveloperCategorization(selectedRepo);
        
        let category = 'uncategorized';
        if (categorization.connectors.includes(id)) {
          category = 'connector';
        } else if (categorization.mavens.includes(id)) {
          category = 'maven';
        } else if (categorization.jacks.includes(id)) {
          category = 'jack';
        }
        
        setDeveloper({
          ...profileData,
          category
        });
        
        // Set contribution history (last 12 months)
        setContributionHistory(profileData.contributionHistory || []);
        
        // Set file contributions (top files)
        setFileContributions(profileData.fileContributions || []);
        
        // Set collaborators (developers who worked with this developer)
        setCollaborators(profileData.collaborators || []);
      } catch (err) {
        console.error('Error fetching developer profile:', err);
        setError('Failed to load developer profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeveloperProfile();
  }, [selectedRepo, id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Format contribution history for charts
  const getContributionChartData = () => {
    if (!contributionHistory.length) return [];
    
    return contributionHistory.map(month => ({
      name: month.month,
      commits: month.commits,
      pullRequests: month.pullRequests,
      reviews: month.reviews,
      issues: month.issues
    }));
  };
  
  // Get contribution total by type
  const getContributionTotal = (type) => {
    if (!contributionHistory.length) return 0;
    
    return contributionHistory.reduce((total, month) => total + (month[type] || 0), 0);
  };
  
  // Get file contributions for pie chart
  const getFileContributionsPieData = () => {
    if (!fileContributions.length) return [];
    
    // Group by file type
    const fileTypeMap = {};
    fileContributions.forEach(file => {
      const fileType = file.path.split('.').pop() || 'unknown';
      if (!fileTypeMap[fileType]) {
        fileTypeMap[fileType] = 0;
      }
      fileTypeMap[fileType] += file.commits;
    });
    
    // Convert to chart data format
    return Object.entries(fileTypeMap).map(([fileType, commits]) => ({
      name: fileType,
      value: commits
    }));
  };
  
  // Get category name from category code
  const getCategoryName = (category) => {
    switch (category) {
      case 'connector':
        return 'Connector';
      case 'maven':
        return 'Maven';
      case 'jack':
        return 'Jack';
      default:
        return 'Uncategorized';
    }
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    return DEVELOPER_COLORS[category] || DEVELOPER_COLORS.uncategorized;
  };

  if (!selectedRepo) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please select a repository to view developer profiles.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/developers')}
        >
          Back to Developers
        </Button>
      </Box>
    );
  }

  if (!developer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Developer not found or no contribution data available.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/developers')}
        >
          Back to Developers
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={() => navigate('/developers')}
        sx={{ mb: 3 }}
      >
        Back to Developers
      </Button>
      
      {/* Developer Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              src={developer.avatarUrl} 
              sx={{ width: 120, height: 120, mb: 2 }}
            >
              {(developer.name || developer.username || '?').charAt(0).toUpperCase()}
            </Avatar>
            <Chip 
              label={getCategoryName(developer.category)}
              sx={{ 
                bgcolor: getCategoryColor(developer.category),
                color: 'white',
                fontSize: '1rem',
                height: 32
              }}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h4" gutterBottom>
              {developer.name || developer.username}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              @{developer.username}
            </Typography>
            
            {developer.email && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                {developer.email}
              </Typography>
            )}
            
            {developer.githubUrl && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                <GitHubIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                <a href={developer.githubUrl} target="_blank" rel="noopener noreferrer">
                  GitHub Profile
                </a>
              </Typography>
            )}
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item>
                <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                  <Typography variant="h4" color={CHART_COLORS.commits}>
                    {getContributionTotal('commits')}
                  </Typography>
                  <Typography variant="body2">Commits</Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                  <Typography variant="h4" color={CHART_COLORS.pullRequests}>
                    {getContributionTotal('pullRequests')}
                  </Typography>
                  <Typography variant="body2">Pull Requests</Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                  <Typography variant="h4" color={CHART_COLORS.reviews}>
                    {getContributionTotal('reviews')}
                  </Typography>
                  <Typography variant="body2">Reviews</Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                  <Typography variant="h4" color={CHART_COLORS.issues}>
                    {getContributionTotal('issues')}
                  </Typography>
                  <Typography variant="body2">Issues</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Developer Insights */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Developer Insights" 
          titleTypographyProps={{ variant: 'h5' }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2, 
                bgcolor: `${getCategoryColor(developer.category)}20`, 
                borderRadius: 1,
                height: '100%'
              }}>
                <Typography variant="h6" sx={{ color: getCategoryColor(developer.category) }} gutterBottom>
                  {getCategoryName(developer.category)} Profile
                </Typography>
                <Typography variant="body2" paragraph>
                  {developer.category === 'connector' && (
                    "This developer bridges different parts of the project, connecting teams and modules. They contribute to multiple, otherwise unconnected files and collaborate with distinct developer groups."
                  )}
                  {developer.category === 'maven' && (
                    "This developer is a specialist with deep, focused contributions in specific areas of the codebase. They have expert knowledge in their domain and are the go-to person for those components."
                  )}
                  {developer.category === 'jack' && (
                    "This developer has broad, general knowledge across various parts of the project without deep specialization. They're flexible and can support multiple modules effectively."
                  )}
                  {developer.category === 'uncategorized' && (
                    "This developer doesn't have enough contribution data yet to determine their working pattern. More activity is needed for classification."
                  )}
                </Typography>
                <List dense>
                  {developer.category !== 'uncategorized' && (
                    <>
                      <ListItem>
                        <ListItemText 
                          primary="Contribution Focus" 
                          secondary={developer.category === 'connector' 
                            ? 'Cross-functional components' 
                            : developer.category === 'maven'
                              ? 'Deep domain expertise'
                              : 'Broad, versatile contributions'
                          } 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Knowledge Distribution" 
                          secondary={developer.category === 'connector' 
                            ? 'Connecting dispersed components' 
                            : developer.category === 'maven'
                              ? 'Concentrated in specific areas'
                              : 'Evenly distributed across codebase'
                          } 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Team Role Value" 
                          secondary={developer.category === 'connector' 
                            ? 'Bridging teams and knowledge areas' 
                            : developer.category === 'maven'
                              ? 'Domain expert and knowledge source'
                              : 'Flexible support across various areas'
                          } 
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                <Grid container spacing={2}>
                  {developer.metrics && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">
                          Code Ownership
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {developer.metrics.codeOwnership || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          Percentage of code primarily maintained by this developer
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">
                          Bus Factor Contribution
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {developer.metrics.busFactorContribution || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          Files where this developer is the primary knowledge holder
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">
                          Collaboration Index
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {developer.metrics.collaborationIndex || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          Measure of how frequently this developer works with others
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">
                          Impact Score
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {developer.metrics.impactScore || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          Weighted contribution impact across the codebase
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="developer profile tabs"
        >
          <Tab label="Activity" />
          <Tab label="File Contributions" />
          <Tab label="Collaborators" />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <CardHeader title="Contribution Activity" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getContributionChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="commits" 
                    name="Commits"
                    stroke={CHART_COLORS.commits} 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pullRequests" 
                    name="Pull Requests"
                    stroke={CHART_COLORS.pullRequests} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reviews" 
                    name="Reviews"
                    stroke={CHART_COLORS.reviews} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="issues" 
                    name="Issues"
                    stroke={CHART_COLORS.issues} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardHeader title="Top File Contributions" />
              <CardContent>
                <List>
                  {fileContributions.length > 0 ? (
                    fileContributions.slice(0, 10).map((file, index) => (
                      <ListItem key={index} divider={index < fileContributions.length - 1}>
                        <ListItemText
                          primary={file.path}
                          secondary={`${file.commits} commits, ${file.linesAdded} lines added, ${file.linesDeleted} lines deleted`}
                          primaryTypographyProps={{ style: { fontFamily: 'monospace' } }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" align="center">
                      No file contribution data available.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card>
              <CardHeader title="File Type Distribution" />
              <CardContent sx={{ height: 300 }}>
                {getFileContributionsPieData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getFileContributionsPieData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getFileContributionsPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45 % 360}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" color="textSecondary">
                      No file type data available.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {tabValue === 2 && (
        <Card>
          <CardHeader title="Top Collaborators" />
          <CardContent>
            {collaborators.length > 0 ? (
              <Grid container spacing={2}>
                {collaborators.map((collaborator, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                      onClick={() => navigate(`/developers/${collaborator.id}`)}
                    >
                      <Avatar 
                        src={collaborator.avatarUrl} 
                        sx={{ mr: 2 }}
                      >
                        {(collaborator.name || collaborator.username || '?').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {collaborator.name || collaborator.username}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {collaborator.collaborationCount} shared contributions
                        </Typography>
                        {collaborator.category && (
                          <Chip 
                            size="small" 
                            label={getCategoryName(collaborator.category)}
                            sx={{ mt: 0.5, bgcolor: getCategoryColor(collaborator.category), color: 'white' }}
                          />
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary" align="center">
                No collaborator data available.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Related Actions */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Button
            variant="outlined"
            startIcon={<AccountTreeIcon />}
            onClick={() => navigate('/reports/traceability')}
            sx={{ mr: 1 }}
          >
            View in Network Graph
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShowChartIcon />}
            onClick={() => navigate(`/reports/heatmap?developer=${id}`)}
          >
            View Developer Heatmap
          </Button>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          color="primary"
        >
          Export Developer Report
        </Button>
      </Box>
    </Box>
  );
};

export default DeveloperProfile;