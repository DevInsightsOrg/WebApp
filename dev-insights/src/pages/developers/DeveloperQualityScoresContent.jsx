import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert
} from '@mui/material';
import apiService from '../../services/apiService';

const DeveloperQualityScoresContent = ({ repoFullName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      setError(null);
      const safe = async (p) => {
        try { return await p; } catch (e) { console.error(e); return null; }
      };
      const result = await safe(
        apiService.getDeveloperQualityScores(repoFullName)
      );
      if (result?.developer_scores) {
        setScores(result.developer_scores);
      } else {
        setError('Failed to load developer quality scores.');
      }
      setLoading(false);
    };
    fetchScores();
  }, [repoFullName]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Developer Quality Scores
      </Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>GitHub</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Total Quality Score</TableCell>
              <TableCell align="right">Commit Count</TableCell>
              <TableCell align="right">Average Quality</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scores.map(row => (
              <TableRow key={row.github} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.github}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell align="right">{row.total_quality_score}</TableCell>
                <TableCell align="right">{row.commit_count}</TableCell>
                <TableCell align="right">{row.average_quality.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DeveloperQualityScoresContent;