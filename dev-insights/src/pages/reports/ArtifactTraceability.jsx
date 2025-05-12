import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';
import { useRepo } from '../../context/RepoContext';
import graphDbService from '../../services/graphDbService';

// Color mapping for node types
const NODE_COLORS = {
  developer: '#8884d8',
  file: '#82ca9d',
  commit: '#ffc658',
  issue: '#ff8042',
  pullRequest: '#0088FE'
};

// Edge color mapping based on relationship type
const EDGE_COLORS = {
  collaborated: '#8884d8',
  modified: '#82ca9d',
  authored: '#ffc658',
  created: '#ff8042',
  resolved: '#0088FE',
  referenced: '#aaaaaa'
};

const ArtifactTraceability = () => {
  const { selectedRepo } = useRepo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [graphMode, setGraphMode] = useState('full'); // 'full', 'developer', 'file'
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [developers, setDevelopers] = useState([]);
  const [fileCategories, setFileCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [developerCategories, setDeveloperCategories] = useState({
    connectors: [],
    mavens: [],
    jacks: []
  });
  const [showLabels, setShowLabels] = useState(true);
  const graphRef = useRef();

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!selectedRepo) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Parse repository owner and name
        const [repoOwner, repoName] = selectedRepo.split('/');
        
        // Fetch developers
        const developersData = await graphDbService.getDeveloperContributions(repoOwner, repoName);
        setDevelopers(developersData);
        
        // Fetch developer categorization
        const categorization = await Promise.all([
          graphDbService.getJackDevelopers(repoOwner, repoName),
          graphDbService.getMavenDevelopers(repoOwner, repoName),
          graphDbService.getConnectorDevelopers(repoOwner, repoName)
        ]);
        
        setDeveloperCategories({
          jacks: categorization[0],
          mavens: categorization[1],
          connectors: categorization[2]
        });
        
        // Fetch critical files to extract categories
        const criticalFiles = await graphDbService.getCriticalFiles(repoOwner, repoName);
        
        // Process file paths to extract categories
        const categories = criticalFiles.reduce((acc, file) => {
          const pathParts = file.file_path.split('/');
          const category = pathParts.length > 1 ? pathParts[0] : 'root';
          
          if (!acc.includes(category)) {
            acc.push(category);
          }
          
          return acc;
        }, []);
        
        setFileCategories(categories);
        
        // Get graph data
        const atgData = await graphDbService.getArtifactTraceabilityGraph(repoOwner, repoName);
        setGraphData(atgData);
      } catch (err) {
        console.error('Error fetching traceability data:', err);
        setError('Failed to load artifact traceability data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [selectedRepo]);
  
  // Fetch filtered graph data when filters change
  useEffect(() => {
    const fetchFilteredGraphData = async () => {
      if (!selectedRepo || (!selectedDeveloper && !selectedCategory && graphMode === 'full')) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Parse repository owner and name
        const [repoOwner, repoName] = selectedRepo.split('/');
        
        let params = {};
        
        if (graphMode === 'developer' && selectedDeveloper) {
          params.developerId = selectedDeveloper;
        } else if (graphMode === 'file' && selectedCategory) {
          params.fileCategory = selectedCategory;
        }
        
        // Fetch filtered ATG data
        const atgData = await graphDbService.getArtifactTraceabilityGraph(repoOwner, repoName, params);
        setGraphData(atgData);
      } catch (err) {
        console.error('Error fetching filtered graph data:', err);
        setError('Failed to load filtered graph data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (graphMode !== 'full' || selectedDeveloper || selectedCategory) {
      fetchFilteredGraphData();
    }
  }, [selectedRepo, graphMode, selectedDeveloper, selectedCategory]);
  
  // Handle graph mode change
  const handleGraphModeChange = (event, newMode) => {
    if (newMode) {
      setGraphMode(newMode);
      
      // Reset selections when mode changes
      if (newMode !== 'developer') {
        setSelectedDeveloper('');
      }
      if (newMode !== 'file') {
        setSelectedCategory('');
      }
    }
  };
  
  // Handle developer selection change
  const handleDeveloperChange = (event) => {
    setSelectedDeveloper(event.target.value);
  };
  
  // Handle file category selection change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };
  
  // Toggle node labels
  const toggleLabels = () => {
    setShowLabels(!showLabels);
  };
  
  // Center and zoom graph
  const resetGraphView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };
  
  // Get developer category for a developer
  const getDeveloperCategory = (githubUsername) => {
    const isJack = developerCategories.jacks.some(dev => dev.github === githubUsername);
    const isMaven = developerCategories.mavens.some(dev => dev.github === githubUsername);
    const isConnector = developerCategories.connectors.some(dev => dev.github === githubUsername);
    
    if (isConnector) return 'Connector';
    if (isMaven) return 'Maven';
    if (isJack) return 'Jack';
    return 'Uncategorized';
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Connector':
        return '#8884d8';
      case 'Maven':
        return '#82ca9d';
      case 'Jack':
        return '#ffc658';
      default:
        return '#cccccc';
    }
  };
  
  // Calculate graph stats
  const graphStats = {
    nodes: graphData.nodes.length,
    links: graphData.links.length,
    developers: graphData.nodes.filter(node => node.type === 'developer').length,
    files: graphData.nodes.filter(node => node.type === 'file').length,
    commits: graphData.nodes.filter(node => node.type === 'commit').length,
    prs: graphData.nodes.filter(node => node.type === 'pullRequest').length,
    issues: graphData.nodes.filter(node => node.type === 'issue').length
  };

  if (!selectedRepo) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please select a repository to view artifact traceability.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Artifact Traceability Graph
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Visualize the relationships between developers, files, commits, pull requests, and issues.
      </Typography>
      
      {/* Graph Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Graph Mode:
            </Typography>
            <ToggleButtonGroup
              value={graphMode}
              exclusive
              onChange={handleGraphModeChange}
              size="small"
              fullWidth
            >
              <ToggleButton value="full">
                Full Graph
              </ToggleButton>
              <ToggleButton value="developer">
                Developer Focus
              </ToggleButton>
              <ToggleButton value="file">
                File Category
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          {graphMode === 'developer' && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="developer-select-label">Developer</InputLabel>
                <Select
                  labelId="developer-select-label"
                  id="developer-select"
                  value={selectedDeveloper}
                  label="Developer"
                  onChange={handleDeveloperChange}
                  disabled={loading || developers.length === 0}
                >
                  {developers.map(dev => (
                    <MenuItem key={dev.github} value={dev.github}>
                      {dev.name || dev.github} ({getDeveloperCategory(dev.github)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          {graphMode === 'file' && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="category-select-label">File Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={selectedCategory}
                  label="File Category"
                  onChange={handleCategoryChange}
                  disabled={loading || fileCategories.length === 0}
                >
                  {fileCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={toggleLabels}
                fullWidth
              >
                {showLabels ? 'Hide Labels' : 'Show Labels'}
              </Button>
              <Button
                variant="outlined"
                onClick={resetGraphView}
                fullWidth
              >
                Reset View
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={9}>
            <Paper sx={{ height: 600, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                <Chip 
                  label={`${graphStats.nodes} nodes, ${graphStats.links} connections`}
                  variant="outlined"
                  size="small"
                />
              </Box>
              {graphData.nodes.length > 0 ? (
                <ForceGraph2D
                  ref={graphRef}
                  graphData={graphData}
                  nodeRelSize={6}
                  nodeVal={(node) => {
                    if (node.type === 'developer') return 10;
                    return 5;
                  }}
                  nodeColor={(node) => {
                    if (node.type === 'developer') {
                      return getCategoryColor(getDeveloperCategory(node.id));
                    }
                    return NODE_COLORS[node.type] || '#cccccc';
                  }}
                  linkColor={(link) => EDGE_COLORS[link.type] || '#aaaaaa'}
                  nodeLabel={(node) => {
                    if (node.type === 'developer') {
                      const category = getDeveloperCategory(node.id);
                      return `${node.name || node.id} (${category})`;
                    } else if (node.type === 'file') {
                      return `File: ${node.name || node.id}`;
                    } else if (node.type === 'commit') {
                      return `Commit: ${node.id.substring(0, 7)}`;
                    } else if (node.type === 'pullRequest') {
                      return `PR: ${node.name || node.id}`;
                    } else if (node.type === 'issue') {
                      return `Issue: ${node.name || node.id}`;
                    }
                    return node.id;
                  }}
                  linkLabel={(link) => `${link.source.id || link.source} ${link.type} ${link.target.id || link.target}`}
                  linkWidth={(link) => 1 + (link.value ? Math.sqrt(link.value) / 3 : 0)}
                  nodeCanvasObjectMode={() => showLabels ? 'after' : undefined}
                  nodeCanvasObject={(node, ctx, globalScale) => {
                    if (!showLabels) return;
                    
                    const label = node.name || 
                      (typeof node.id === 'string' ? node.id.split('/').pop() : node.id);
                    
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'black';
                    ctx.fillText(label, node.x, node.y + 10);
                  }}
                  warmupTicks={100}
                  cooldownTicks={100}
                  onEngineStop={() => resetGraphView()}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="textSecondary">
                    No graph data available with the current filters.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ mb: 2 }}>
              <CardHeader title="Graph Legend" titleTypographyProps={{ variant: 'h6' }} />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Node Types:
                </Typography>
                <List dense>
                  {Object.entries(NODE_COLORS).map(([type, color]) => (
                    <ListItem key={type} disablePadding>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: color,
                          mr: 1
                        }}
                      />
                      <ListItemText primary={type.charAt(0).toUpperCase() + type.slice(1)} />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Developer Types:
                </Typography>
                <List dense>
                  <ListItem disablePadding>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: '#8884d8',
                        mr: 1
                      }}
                    />
                    <ListItemText 
                      primary="Connector" 
                      secondary="Bridges different parts of the project"
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: '#82ca9d',
                        mr: 1
                      }}
                    />
                    <ListItemText 
                      primary="Maven" 
                      secondary="Specialist with deep, focused contributions"
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: '#ffc658',
                        mr: 1
                      }}
                    />
                    <ListItemText 
                      primary="Jack" 
                      secondary="Generalist with broad knowledge"
                    />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Connection Types:
                </Typography>
                <List dense>
                  {Object.entries(EDGE_COLORS).map(([type, color]) => (
                    <ListItem key={type} disablePadding>
                      <Box
                        sx={{
                          width: 16,
                          height: 4,
                          bgcolor: color,
                          mr: 1
                        }}
                      />
                      <ListItemText primary={type.charAt(0).toUpperCase() + type.slice(1)} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader title="Graph Statistics" titleTypographyProps={{ variant: 'h6' }} />
              <CardContent>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary={`${graphStats.developers} Developers`}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary={`${graphStats.files} Files`}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary={`${graphStats.commits} Commits`}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary={`${graphStats.prs} Pull Requests`}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary={`${graphStats.issues} Issues`}
                    />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="textSecondary">
                  The Artifact Traceability Graph visualizes connections between developers and artifacts
                  across the repository, showing collaboration patterns and knowledge distribution in the ReMediCard.io project.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ArtifactTraceability;