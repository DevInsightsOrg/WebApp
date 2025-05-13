import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  AccountTree as AccountTreeIcon,
  GridOn as HeatmapIcon,
  Settings as SettingsIcon,
  GitHub as GitHubIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  Storage as StorageIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useRepo } from '../../context/RepoContext';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const MainLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [repoMenuAnchorEl, setRepoMenuAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const { 
    repositories, 
    selectedRepo, 
    selectRepository, 
    syncRepository,
    lastSyncDate,
    isLoading
  } = useRepo();
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRepoMenuOpen = (event) => {
    setRepoMenuAnchorEl(event.currentTarget);
  };

  const handleRepoMenuClose = () => {
    setRepoMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRepoSelect = (repoId) => {
  // Find the full repository object to get both id and fullName
  const selectedRepository = repositories.find(r => r.id === repoId);
  if (selectedRepository) {
    // Pass both parameters to selectRepository
    selectRepository(repoId, selectedRepository.fullName);
  }
  handleRepoMenuClose();
};

  const handleSync = async () => {
    await syncRepository();
  };

  const selectedRepoName = repositories.find(r => r.id === selectedRepo)?.name || 'Select Repository';

  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Developers', icon: <PeopleIcon />, path: '/developers' },
    { text: 'Code Contribution Analysis', icon: <AssessmentIcon />, path: '/code-contribution-analysis' },
    { text: 'Issues and Pull Requests Tracking', icon: <AssignmentIcon />, path: '/issues' },
    { text: 'Reports', icon: <BarChartIcon />, subItems: [
      { text: 'Artifact Traceability', icon: <AccountTreeIcon />, path: '/reports/traceability' },
      { text: 'Developer Heatmap', icon: <HeatmapIcon />, path: '/reports/heatmap' },
    ]},
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Repositories', icon: <StorageIcon />, path: '/settings/repositories' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            DevInsights
          </Typography>
          
          {/* Repository Selector */}
          <Button 
            color="inherit" 
            onClick={handleRepoMenuOpen}
            startIcon={<GitHubIcon />}
            endIcon={<MenuIcon />}
            sx={{ mr: 2 }}
          >
            {selectedRepoName}
          </Button>
          <Menu
            anchorEl={repoMenuAnchorEl}
            open={Boolean(repoMenuAnchorEl)}
            onClose={handleRepoMenuClose}
          >
            {repositories.map((repo) => (
              <MenuItem 
                key={repo.id} 
                onClick={() => handleRepoSelect(repo.id)}
                selected={repo.id === selectedRepo}
              >
                {repo.name}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={() => navigate('/settings/repositories')}>
              Manage Repositories
            </MenuItem>
          </Menu>
          
          {/* Sync Button */}
          <IconButton 
            color="inherit" 
            onClick={handleSync} 
            disabled={isLoading || !selectedRepo}
            title={lastSyncDate ? `Last synced: ${new Date(lastSyncDate).toLocaleString()}` : 'Sync repository'}
          >
            <RefreshIcon />
          </IconButton>
          
          {/* User Menu */}
          <IconButton onClick={handleMenuOpen} color="inherit">
            <Avatar 
              alt={user?.name || 'User'} 
              src={user?.avatarUrl} 
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              {user?.name || 'User'}
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item) => 
              item.subItems ? (
                <div key={item.text}>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                  <List disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem 
                        key={subItem.text} 
                        disablePadding 
                        sx={{ pl: 4 }}
                        onClick={() => navigate(subItem.path)}
                      >
                        <ListItemButton>
                          <ListItemIcon>{subItem.icon}</ListItemIcon>
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </div>
              ) : (
                <ListItem 
                  key={item.text} 
                  disablePadding
                  onClick={() => navigate(item.path)}
                >
                  <ListItemButton>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              )
            )}
          </List>
        </Box>
      </Drawer>
      
      <Main open={drawerOpen}>
        <Toolbar /> {/* This creates space below the AppBar */}
        <Outlet /> {/* This renders the current route */}
      </Main>
    </Box>
  );
};

export default MainLayout;