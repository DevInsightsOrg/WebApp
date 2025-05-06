import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  GitHub as GitHubIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Link as LinkIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useRepo } from '../../context/RepoContext';
import apiService from '../../services/apiService';

const Repositories = () => {
  const { repositories, selectedRepo, selectRepository, syncRepository } = useRepo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableRepos, setAvailableRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [repoToRemove, setRepoToRemove] = useState(null);
  const [syncLoading, setSyncLoading] = useState({});

  // Fetch available repositories
  useEffect(() => {
    const fetchAvailableRepos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch GitHub repositories that are available to connect
        const availableReposData = await apiService.getAvailableGitHubRepositories();
        setAvailableRepos(availableReposData);
      } catch (err) {
        console.error('Error fetching available repositories:', err);
        setError('Failed to load available repositories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableRepos();
  }, []);

  // Filter repositories based on search query
  useEffect(() => {
    if (!availableRepos.length) return;
    
    const filtered = availableRepos.filter(repo => 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredRepos(filtered);
  }, [availableRepos, searchQuery]);
  
  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle repository selection
  const handleSelectRepo = (repoId) => {
    selectRepository(repoId);
  };
  
  // Handle repository sync
  const handleSyncRepo = async (repoId) => {
    setSyncLoading(prev => ({ ...prev, [repoId]: true }));
    
    try {
      await syncRepository(repoId);
    } catch (error) {
      console.error('Error syncing repository:', error);
    } finally {
      setSyncLoading(prev => ({ ...prev, [repoId]: false }));
    }
  };
  
  // Open add repository dialog
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };
  
  // Close add repository dialog
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  
  // Handle adding a repository
  const handleAddRepository = async (repoId) => {
    setLoading(true);
    
    try {
      await apiService.connectRepository(repoId);
      // Refresh repositories list
      window.location.reload();
    } catch (err) {
      console.error('Error connecting repository:', err);
      setError('Failed to connect repository. Please try again.');
    } finally {
      setLoading(false);
      handleCloseAddDialog();
    }
  };
  
  // Open remove repository dialog
  const handleOpenRemoveDialog = (repo) => {
    setRepoToRemove(repo);
    setOpenRemoveDialog(true);
  };
  
  // Close remove repository dialog
  const handleCloseRemoveDialog = () => {
    setOpenRemoveDialog(false);
    setRepoToRemove(null);
  };
  
  // Handle removing a repository
  const handleRemoveRepository = async () => {
    if (!repoToRemove) return;
    
    setLoading(true);
    
    try {
      await apiService.disconnectRepository(repoToRemove.id);
      // Refresh repositories list
      window.location.reload();
    } catch (err) {
      console.error('Error disconnecting repository:', err);
      setError('Failed to disconnect repository. Please try again.');
    } finally {
      setLoading(false);
      handleCloseRemoveDialog();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Repositories
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Connect and manage GitHub repositories for developer analytics.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Connected Repositories */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Connected Repositories" 
              action={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                >
                  Connect Repository
                </Button>
              }
            />
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : repositories.length > 0 ? (
                <List>
                  {repositories.map((repo) => (
                    <ListItem 
                      key={repo.id}
                      component={Paper}
                      elevation={1}
                      sx={{ 
                        mb: 2, 
                        bgcolor: selectedRepo === repo.id ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
                        border: selectedRepo === repo.id ? '1px solid rgba(63, 81, 181, 0.5)' : '1px solid rgba(0, 0, 0, 0.12)'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <GitHubIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {repo.name}
                            {repo.isPrivate && (
                              <Chip 
                                size="small" 
                                label="Private" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {repo.description || 'No description'}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip 
                                size="small" 
                                icon={<CodeIcon />} 
                                label={`${repo.language || 'Unknown'}`}
                                sx={{ mr: 1 }}
                              />
                              {repo.lastSyncDate && (
                                <Chip 
                                  size="small" 
                                  icon={<RefreshIcon />} 
                                  label={`Last synced: ${new Date(repo.lastSyncDate).toLocaleString()}`}
                                />
                              )}
                            </Box>
                          </>
                        }
                      />
                      <ListItemSecondaryAction sx={{ display: 'flex' }}>
                        <Tooltip title="Select repository">
                          <IconButton 
                            edge="end" 
                            onClick={() => handleSelectRepo(repo.id)}
                            color={selectedRepo === repo.id ? 'primary' : 'default'}
                          >
                            <LinkIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sync repository">
                          <IconButton 
                            edge="end" 
                            onClick={() => handleSyncRepo(repo.id)}
                            disabled={syncLoading[repo.id]}
                            sx={{ ml: 1 }}
                          >
                            {syncLoading[repo.id] ? (
                              <CircularProgress size={24} />
                            ) : (
                              <RefreshIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Repository settings">
                          <IconButton edge="end" sx={{ ml: 1 }}>
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Disconnect repository">
                          <IconButton 
                            edge="end" 
                            color="error" 
                            onClick={() => handleOpenRemoveDialog(repo)}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    No repositories connected yet.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddDialog}
                  >
                    Connect Your First Repository
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Add Repository Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Connect GitHub Repository</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Select a GitHub repository to connect with DevInsights for developer analytics.
          </DialogContentText>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredRepos.length > 0 ? (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {filteredRepos.map((repo) => (
                <ListItem 
                  key={repo.id}
                  component={Paper}
                  elevation={1}
                  sx={{ mb: 2 }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <GitHubIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {repo.name}
                        {repo.isPrivate && (
                          <Chip 
                            size="small" 
                            label="Private" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {repo.description || 'No description'}
                        </Typography>
                        {repo.language && (
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              size="small" 
                              icon={<CodeIcon />} 
                              label={repo.language}
                            />
                          </Box>
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddRepository(repo.id)}
                      disabled={repositories.some(r => r.id === repo.id)}
                    >
                      {repositories.some(r => r.id === repo.id) ? 'Connected' : 'Connect'}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No repositories found matching your search.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Remove Repository Dialog */}
      <Dialog
        open={openRemoveDialog}
        onClose={handleCloseRemoveDialog}
      >
        <DialogTitle>Disconnect Repository</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to disconnect the repository '{repoToRemove?.name}'? 
            This will remove all associated analytics data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog}>Cancel</Button>
          <Button 
            onClick={handleRemoveRepository} 
            color="error"
            variant="contained"
          >
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Repositories;