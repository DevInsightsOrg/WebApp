import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  AccountTree as AccountTreeIcon,
  ShowChart as ShowChartIcon,
  Code as CodeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useRepo } from '../../context/RepoContext';
import apiService from '../../services/apiService';

// Define colors for developer categories
const DEVELOPER_COLORS = {
  connector: '#8884d8',
  maven: '#82ca9d',
  jack: '#ffc658'
};

const DevelopersList = () => {
  const { selectedRepo } = useRepo();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [developerStats, setDeveloperStats] = useState({
    totalDevelopers: 0,
    activeDevelopers: 0,
    typeDistribution: []
  });

  // Fetch developers and stats
  useEffect(() => {
    const fetchDevelopers = async () => {
      if (!selectedRepo) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch developers
        const developersData = await apiService.getDevelopers(selectedRepo);
        
        // Fetch developer categorization
        const categorization = await apiService.getDeveloperCategorization(selectedRepo);
        
        // Merge developer data with categorization
        const mergedData = developersData.map(developer => {
          let category = 'uncategorized';
          if (categorization.connectors.includes(developer.id)) {
            category = 'connector';
          } else if (categorization.mavens.includes(developer.id)) {
            category = 'maven';
          } else if (categorization.jacks.includes(developer.id)) {
            category = 'jack';
          }
          
          return {
            ...developer,
            category
          };
        });
        
        // Calculate developer stats
        const stats = {
          totalDevelopers: mergedData.length,
          activeDevelopers: mergedData.filter(dev => dev.isActive).length,
          typeDistribution: [
            { name: 'Connectors', value: categorization.connectors.length },
            { name: 'Mavens', value: categorization.mavens.length },
            { name: 'Jacks', value: categorization.jacks.length },
            { name: 'Uncategorized', value: mergedData.length - 
              (categorization.connectors.length + 
               categorization.mavens.length + 
               categorization.jacks.length) }
          ]
        };
        
        setDevelopers(mergedData);
        setFilteredDevelopers(mergedData);
        setDeveloperStats(stats);
      } catch (err) {
        console.error('Error fetching developers:', err);
        setError('Failed to load developer data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevelopers();
  }, [selectedRepo]);
  
  // Filter developers based on search query and tab selection
  useEffect(() => {
    if (!developers.length) return;
    
    let filtered = [...developers];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dev => 
        (dev.name && dev.name.toLowerCase().includes(query)) ||
        (dev.username && dev.username.toLowerCase().includes(query)) ||
        (dev.email && dev.email.toLowerCase().includes(query))
      );
    }
    
    // Apply tab filter
    if (tabValue === 1) {
      filtered = filtered.filter(dev => dev.category === 'connector');
    } else if (tabValue === 2) {
      filtered = filtered.filter(dev => dev.category === 'maven');
    } else if (tabValue === 3) {
      filtered = filtered.filter(dev => dev.category === 'jack');
    }
    
    setFilteredDevelopers(filtered);
  }, [developers, searchQuery, tabValue]);
  
  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Navigate to developer profile
  const viewDeveloperProfile = (developerId) => {
    navigate(`/developers/${developerId}`);
  };
  
  // Get chip color and label for developer category
  const getDeveloperCategoryChip = (category) => {
    let color = 'default';
    let label = 'Uncategorized';
    
    switch (category) {
      case 'connector':
        color = 'primary';
        label = 'Connector';
        break;
      case 'maven':
        color = 'success';
        label = 'Maven';
        break;
      case 'jack':
        color = 'warning';
        label = 'Jack';
        break;
    }
    
    return (
      <Chip 
        size="small" 
        color={color} 
        label={label} 
      />
    );
  };

  if (!selectedRepo) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please select a repository to view developers.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Developers
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Overview of all developers and their classifications based on contribution patterns.
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Developer Summary" />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="div">
                      {developerStats.totalDevelopers}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                      Total Developers
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CodeIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="div">
                      {developerStats.activeDevelopers}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                      Active Contributors
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Developer Distribution" />
                <CardContent sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={developerStats.typeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {developerStats.typeDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === 'Connectors' ? DEVELOPER_COLORS.connector :
                              entry.name === 'Mavens' ? DEVELOPER_COLORS.maven :
                              entry.name === 'Jacks' ? DEVELOPER_COLORS.jack : '#cccccc'
                            } 
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Search and Filter */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Search developers..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AccountTreeIcon />}
                    onClick={() => navigate('/reports/traceability')}
                    sx={{ mr: 1 }}
                  >
                    View Network Graph
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ShowChartIcon />}
                    onClick={() => navigate('/reports/heatmap')}
                  >
                    View Developer Heatmap
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Developer List Tabs */}
          <Box sx={{ mb: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              aria-label="developer tabs"
            >
              <Tab label="All Developers" />
              <Tab label="Connectors" />
              <Tab label="Mavens" />
              <Tab label="Jacks" />
            </Tabs>
          </Box>
          
          {/* Developer List */}
          <Box>
            {filteredDevelopers.length > 0 ? (
              <Grid container spacing={2}>
                {filteredDevelopers.map(developer => (
                  <Grid item xs={12} md={6} lg={4} key={developer.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={developer.avatarUrl} 
                            sx={{ width: 60, height: 60, mr: 2 }}
                          >
                            {(developer.name || developer.username || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="div">
                              {developer.name || developer.username}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              @{developer.username}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {getDeveloperCategoryChip(developer.category)}
                            </Box>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" component="div">
                              Commits
                            </Typography>
                            <Typography variant="h6" component="div">
                              {developer.stats?.commits || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" component="div">
                              Pull Requests
                            </Typography>
                            <Typography variant="h6" component="div">
                              {developer.stats?.pullRequests || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" component="div">
                              Reviews
                            </Typography>
                            <Typography variant="h6" component="div">
                              {developer.stats?.reviews || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" component="div">
                              Issues
                            </Typography>
                            <Typography variant="h6" component="div">
                              {developer.stats?.issues || 0}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => viewDeveloperProfile(developer.id)}
                          >
                            View Profile
                          </Button>
                          <Box>
                            {developer.githubUrl && (
                              <Tooltip title="GitHub Profile">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  href={developer.githubUrl} 
                                  target="_blank"
                                >
                                  <GitHubIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {developer.email && (
                              <Tooltip title={`Email: ${developer.email}`}>
                                <IconButton size="small" color="primary">
                                  <EmailIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No developers found matching the current filters.
                </Typography>
                <Button 
                  variant="text" 
                  onClick={() => {
                    setSearchQuery('');
                    setTabValue(0);
                  }}
                  sx={{ mt: 1 }}
                >
                  Clear Filters
                </Button>
              </Paper>
            )}
          </Box>
          
          {/* Developer Types Explanation */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Understanding Developer Classifications
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: '#f5f0ff', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: DEVELOPER_COLORS.connector, fontWeight: 'bold' }} gutterBottom>
                    Connectors
                  </Typography>
                  <Typography variant="body2">
                    Developers who bridge different parts of the project or collaborate across multiple teams. They often contribute to unrelated files or submodules and collaborate with distinct developer groups.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: '#f0fff5', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: DEVELOPER_COLORS.maven, fontWeight: 'bold' }} gutterBottom>
                    Mavens
                  </Typography>
                  <Typography variant="body2">
                    Specialists with deep, focused contributions in specific, high-complexity areas of the codebase. They have expert knowledge in their domain and are the go-to people for those components.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: '#fffbf0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: DEVELOPER_COLORS.jack, fontWeight: 'bold' }} gutterBottom>
                    Jacks
                  </Typography>
                  <Typography variant="body2">
                    Developers with broad, general knowledge across various parts of the project without deep specialization. They are ideal for flexible support across modules and can work on multiple areas.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DevelopersList;