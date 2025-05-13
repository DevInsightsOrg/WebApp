import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Box,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  People as PeopleIcon,
  Code as CodeIcon,
  Commit as CommitIcon,
  DeviceHub as CollaborationsIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import graphDbService from '../../services/graphDbService';

const DEVELOPER_TYPES_COLORS = {
  Connector: '#8884d8',
  Maven: '#82ca9d',
  Jack: '#ffc658'
};

const DashboardContent = ({ repoFullName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    developerStats: { total: 0, active: 0 },
    developerTypes: [],
    contributionMetrics: [],
    collaborationCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const [owner, repo] = repoFullName.split('/');
      const safe = async (p) => {
        try { return await p; } catch (e) { console.error(e); return null; }
      };

      const [categories, contributions, collabs] = await Promise.all([
        safe(graphDbService.getAllCategorizedDevelopers(owner, repo)),
        safe(graphDbService.getDeveloperContributions(owner, repo)),
        safe(graphDbService.getCollaborations(owner, repo))
      ]);

      const total = contributions?.length || 0;
      const active = contributions?.filter(d => d.commits > 0).length || 0;

      const types = [
        { name: 'Connectors', value: categories?.connectors.length || 0 },
        { name: 'Mavens', value: categories?.mavens.length || 0 },
        { name: 'Jacks', value: categories?.jacks.length || 0 }
      ];

      const topContribs = (contributions || [])
        .sort((a, b) => b.commits - a.commits)
        .slice(0, 5)
        .map(dev => ({ name: dev.name, commits: dev.commits }));

      const collabCount = collabs?.length || 0;

      setData({
        developerStats: { total, active },
        developerTypes: types,
        contributionMetrics: topContribs,
        collaborationCount: collabCount
      });
      setLoading(false);
    };
    fetchData();
  }, [repoFullName]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress/></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  const { developerStats, developerTypes, contributionMetrics, collaborationCount } = data;

  return (
    <Grid container spacing={3}>
      {/* Left column: Stats */}
      <Grid item xs={12} md={4}>
        <Stack spacing={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }} elevation={2}>
            <PeopleIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">{developerStats.total}</Typography>
            <Typography color="textSecondary">Total Developers</Typography>
          </Paper>

          <Paper sx={{ p: 2, textAlign: 'center' }} elevation={2}>
            <CodeIcon color="secondary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">{developerStats.active}</Typography>
            <Typography color="textSecondary">Active Developers</Typography>
          </Paper>
        </Stack>
      </Grid>

      <Grid item xs={12} md={4}>
        <Stack spacing={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }} elevation={2}>
            <CommitIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">
              {contributionMetrics.reduce((sum, v) => sum + v.commits, 0)}
            </Typography>
            <Typography color="textSecondary">Fetched commit count</Typography>
          </Paper>

          <Paper sx={{ p: 2, textAlign: 'center' }} elevation={2}>
            <CollaborationsIcon color="info" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">{collaborationCount}</Typography>
            <Typography color="textSecondary">Collaborations</Typography>
          </Paper>
        </Stack>
      </Grid>

      {/* Right column: Charts */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Developer Types" />
              <CardContent sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={developerTypes} dataKey="value" outerRadius={80} label>
                      {developerTypes.map(entry => (
                        <Cell key={entry.name} fill={DEVELOPER_TYPES_COLORS[entry.name.slice(0,-1)]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Top Contributors By Commits" />
              <CardContent sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contributionMetrics} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="commits" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DashboardContent;
