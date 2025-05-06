import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Code as CodeIcon,
  Commit as CommitIcon,
  AssignmentTurnedIn as TaskIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useRepo } from '../../context/RepoContext';
import apiService from '../../services/apiService';

const DEVELOPER_TYPES_COLORS = {
  Connector: '#8884d8',
  Maven: '#82ca9d',
  Jack: '#ffc658'
};

const Dashboard = () => {
  const { selectedRepo } = useRepo();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    developerStats: { total: 0, active: 0 },
    developerTypes: [],
    contributionMetrics: [],
    recentActivity: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedRepo) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch developer categorization data
        const categorization = await apiService.getDeveloperCategorization(selectedRepo);
        
        // Fetch contribution metrics
        const metrics = await apiService.getContributionMetrics(selectedRepo);
        
        // Transform data for charts
        const developerTypes = [
          { name: 'Connectors', value: categorization.connectors.length },
          { name: 'Mavens', value: categorization.mavens.length },
          { name: 'Jacks', value: categorization.jacks.length }
        ];
        
        setDashboardData({
          developerStats: {
            total: categorization.totalDevelopers,
            active: categorization.activeDevelopers
          },
          developerTypes,
          contributionMetrics: metrics.contributionsByDeveloper.slice(0, 5), // Top 5 contributors
          recentActivity: metrics.recentActivity.slice(0, 5) // Last 5 activities
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedRepo]);

  if (!selectedRepo) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Please select a repository to view dashboard data.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/settings/repositories')}
          sx={{ mt: 2 }}
        >
          Select Repository
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          DevInsights Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Developer analytics and insights for your team
        </Typography>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={2} 
          sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <PeopleIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5">{dashboardData.developerStats.total}</Typography>
          <Typography variant="body2" color="textSecondary">Total Developers</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={2} 
          sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <CodeIcon color="secondary" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5">{dashboardData.developerStats.active}</Typography>
          <Typography variant="body2" color="textSecondary">Active Developers</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={2} 
          sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <CommitIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5">
            {dashboardData.contributionMetrics.reduce((sum, item) => sum + item.commits, 0)}
          </Typography>
          <Typography variant="body2" color="textSecondary">Total Commits</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={2} 
          sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <TaskIcon color="info" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5">
            {dashboardData.contributionMetrics.reduce((sum, item) => sum + item.prs, 0)}
          </Typography>
          <Typography variant="body2" color="textSecondary">Pull Requests</Typography>
        </Paper>
      </Grid>

      {/* Developer Types Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Developer Types" />
          <CardContent sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.developerTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {dashboardData.developerTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(DEVELOPER_TYPES_COLORS)[index % 3]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Contributors Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Top Contributors" />
          <CardContent sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.contributionMetrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="commits" name="Commits" fill="#8884d8" />
                <Bar dataKey="prs" name="Pull Requests" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Developer Classifications */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="Developer Classifications" 
            action={
              <Button 
                color="primary" 
                onClick={() => navigate('/reports/traceability')}
              >
                View Full Report
              </Button>
            }
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Connectors
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Developers who bridge different parts of the project or collaborate across multiple teams.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {dashboardData.developerTypes[0]?.value > 0 ? (
                      [...Array(Math.min(3, dashboardData.developerTypes[0]?.value || 0))].map((_, i) => (
                        <Chip 
                          key={i}
                          label={`Developer ${i+1}`}
                          color="primary"
                          variant="outlined"
                          onClick={() => navigate('/developers')}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No connectors identified yet.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Mavens
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Specialists with deep, focused contributions in specific areas of the codebase.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {dashboardData.developerTypes[1]?.value > 0 ? (
                      [...Array(Math.min(3, dashboardData.developerTypes[1]?.value || 0))].map((_, i) => (
                        <Chip 
                          key={i}
                          label={`Developer ${i+1}`}
                          color="success"
                          variant="outlined"
                          onClick={() => navigate('/developers')}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No mavens identified yet.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Jacks
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Developers with broad, general knowledge across various parts of the project.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {dashboardData.developerTypes[2]?.value > 0 ? (
                      [...Array(Math.min(3, dashboardData.developerTypes[2]?.value || 0))].map((_, i) => (
                        <Chip 
                          key={i}
                          label={`Developer ${i+1}`}
                          color="warning"
                          variant="outlined"
                          onClick={() => navigate('/developers')}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No jacks identified yet.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="Recent Activity" 
            action={
              <Button color="primary" onClick={() => navigate('/developers')}>
                View All Activity
              </Button>
            }
          />
          <CardContent>
            {dashboardData.recentActivity.length > 0 ? (
              <Grid container spacing={2}>
                {dashboardData.recentActivity.map((activity, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                          {activity.developer}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(activity.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {activity.action} {activity.type === 'commit' ? 'committed' : 'merged PR'}: {activity.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary" align="center">
                No recent activity found.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Dashboard;