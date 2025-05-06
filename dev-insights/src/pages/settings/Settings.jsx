import { useState } from 'react';
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
  Switch,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useRepo } from '../../context/RepoContext';
import apiService from '../../services/apiService';

const Settings = () => {
  const { user, logout } = useAuth();
  const { selectedRepo } = useRepo();
  
  // User settings
  const [userSettings, setUserSettings] = useState({
    notifications: {
      email: true,
      inApp: true,
      weeklyDigest: true
    },
    displaySettings: {
      theme: 'light',
      density: 'comfortable',
      defaultView: 'dashboard'
    }
  });
  
  // Repository settings
  const [repoSettings, setRepoSettings] = useState({
    syncInterval: '3600', // in seconds
    includeIssues: true,
    includePullRequests: true,
    includeCommits: true,
    includeFiles: true,
    atgDepth: 'medium', // depth of ATG analysis
    developerCategorization: {
      enableAutoCategories: true,
      minCommitsForCategorization: 10,
      refreshInterval: '86400' // in seconds
    }
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Handle user settings change
  const handleUserSettingChange = (section, setting, value) => {
    setUserSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: value
      }
    }));
  };
  
  // Handle repository settings change
  const handleRepoSettingChange = (section, setting, value) => {
    if (section) {
      setRepoSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [setting]: value
        }
      }));
    } else {
      setRepoSettings(prev => ({
        ...prev,
        [setting]: value
      }));
    }
  };
  
  // Handle save settings
  const handleSaveSettings = async (type) => {
    setLoading(true);
    
    try {
      if (type === 'user') {
        // Save user settings
        await apiService.updateUserSettings(userSettings);
      } else if (type === 'repo') {
        // Save repository settings
        await apiService.updateRepositorySettings(selectedRepo, repoSettings);
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to save settings. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Configure your preferences and repository settings.
      </Typography>
      
      <Grid container spacing={3}>
        {/* User Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="User Settings" />
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Notifications
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.email}
                      onChange={(e) => handleUserSettingChange('notifications', 'email', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.inApp}
                      onChange={(e) => handleUserSettingChange('notifications', 'inApp', e.target.checked)}
                    />
                  }
                  label="In-App Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.weeklyDigest}
                      onChange={(e) => handleUserSettingChange('notifications', 'weeklyDigest', e.target.checked)}
                    />
                  }
                  label="Weekly Digest Email"
                />
              </FormGroup>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Display Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel id="theme-select-label">Theme</InputLabel>
                    <Select
                      labelId="theme-select-label"
                      id="theme-select"
                      value={userSettings.displaySettings.theme}
                      label="Theme"
                      onChange={(e) => handleUserSettingChange('displaySettings', 'theme', e.target.value)}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System Default</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel id="density-select-label">UI Density</InputLabel>
                    <Select
                      labelId="density-select-label"
                      id="density-select"
                      value={userSettings.displaySettings.density}
                      label="UI Density"
                      onChange={(e) => handleUserSettingChange('displaySettings', 'density', e.target.value)}
                    >
                      <MenuItem value="comfortable">Comfortable</MenuItem>
                      <MenuItem value="compact">Compact</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel id="default-view-select-label">Default View</InputLabel>
                    <Select
                      labelId="default-view-select-label"
                      id="default-view-select"
                      value={userSettings.displaySettings.defaultView}
                      label="Default View"
                      onChange={(e) => handleUserSettingChange('displaySettings', 'defaultView', e.target.value)}
                    >
                      <MenuItem value="dashboard">Dashboard</MenuItem>
                      <MenuItem value="developers">Developers</MenuItem>
                      <MenuItem value="traceability">Artifact Traceability</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                onClick={() => handleSaveSettings('user')}
                disabled={loading}
              >
                Save User Settings
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Repository Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Repository Settings" 
              subheader={selectedRepo ? undefined : "Select a repository to configure its settings"}
            />
            <CardContent>
              {selectedRepo ? (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Synchronization
                  </Typography>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel id="sync-interval-select-label">Sync Interval</InputLabel>
                    <Select
                      labelId="sync-interval-select-label"
                      id="sync-interval-select"
                      value={repoSettings.syncInterval}
                      label="Sync Interval"
                      onChange={(e) => handleRepoSettingChange(null, 'syncInterval', e.target.value)}
                    >
                      <MenuItem value="3600">Hourly</MenuItem>
                      <MenuItem value="21600">Every 6 hours</MenuItem>
                      <MenuItem value="43200">Every 12 hours</MenuItem>
                      <MenuItem value="86400">Daily</MenuItem>
                      <MenuItem value="604800">Weekly</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Data Collection
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={repoSettings.includeCommits}
                          onChange={(e) => handleRepoSettingChange(null, 'includeCommits', e.target.checked)}
                        />
                      }
                      label="Include Commits"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={repoSettings.includePullRequests}
                          onChange={(e) => handleRepoSettingChange(null, 'includePullRequests', e.target.checked)}
                        />
                      }
                      label="Include Pull Requests"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={repoSettings.includeIssues}
                          onChange={(e) => handleRepoSettingChange(null, 'includeIssues', e.target.checked)}
                        />
                      }
                      label="Include Issues"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={repoSettings.includeFiles}
                          onChange={(e) => handleRepoSettingChange(null, 'includeFiles', e.target.checked)}
                        />
                      }
                      label="Include File Contents"
                    />
                  </FormGroup>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>Advanced Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="subtitle2" gutterBottom>
                        Artifact Traceability Graph
                      </Typography>
                      <FormControl fullWidth size="small" margin="normal">
                        <InputLabel id="atg-depth-select-label">ATG Analysis Depth</InputLabel>
                        <Select
                          labelId="atg-depth-select-label"
                          id="atg-depth-select"
                          value={repoSettings.atgDepth}
                          label="ATG Analysis Depth"
                          onChange={(e) => handleRepoSettingChange(null, 'atgDepth', e.target.value)}
                        >
                          <MenuItem value="light">Light (Faster, Less Detailed)</MenuItem>
                          <MenuItem value="medium">Medium (Balanced)</MenuItem>
                          <MenuItem value="deep">Deep (Slower, More Detailed)</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Developer Categorization
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={repoSettings.developerCategorization.enableAutoCategories}
                            onChange={(e) => handleRepoSettingChange('developerCategorization', 'enableAutoCategories', e.target.checked)}
                          />
                        }
                        label="Enable Automatic Developer Classification"
                      />
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Minimum Commits for Categorization"
                            type="number"
                            value={repoSettings.developerCategorization.minCommitsForCategorization}
                            onChange={(e) => handleRepoSettingChange('developerCategorization', 'minCommitsForCategorization', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel id="categorization-interval-select-label">Classification Refresh Interval</InputLabel>
                            <Select
                              labelId="categorization-interval-select-label"
                              id="categorization-interval-select"
                              value={repoSettings.developerCategorization.refreshInterval}
                              label="Classification Refresh Interval"
                              onChange={(e) => handleRepoSettingChange('developerCategorization', 'refreshInterval', e.target.value)}
                            >
                              <MenuItem value="86400">Daily</MenuItem>
                              <MenuItem value="604800">Weekly</MenuItem>
                              <MenuItem value="2592000">Monthly</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </>
              ) : (
                <Alert severity="info">
                  Please select a repository from the dropdown in the header to configure its settings.
                </Alert>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                onClick={() => handleSaveSettings('repo')}
                disabled={loading || !selectedRepo}
              >
                Save Repository Settings
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Account Actions */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Account" />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1">
                    {user?.name || user?.username}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    sx={{ mr: 2 }}
                  >
                    Delete Account
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* About DevInsights */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="About DevInsights" />
            <CardContent>
              <Typography variant="body2" paragraph>
                DevInsights provides actionable insights into developer performance and collaboration by analyzing GitHub repository data.
                It builds Artifact Traceability Graphs (ATGs) to represent and assess developer contributions across the entire project lifecycle.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Version
                    </Typography>
                    <Typography variant="body2">
                      1.0.0
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      License
                    </Typography>
                    <Typography variant="body2">
                      MIT License
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Support
                    </Typography>
                    <Typography variant="body2">
                      <a href="mailto:support@devinsights.app">support@devinsights.app</a>
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;