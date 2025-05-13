import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import RepositoryCheck from '../../components/repository/RepositoryCheck';
import { useNavigate } from 'react-router-dom';
import { useRepo } from '../../context/RepoContext';
import DeveloperQualityScoresContent from './DeveloperQualityScoresContent';

const DeveloperQualityScores = () => {
  const { selectedRepoFullName } = useRepo();
  const navigate = useNavigate();

  if (!selectedRepoFullName) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Please select a repository to view developer quality scores.
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

  return (
    <RepositoryCheck repoFullName={selectedRepoFullName}>
      <DeveloperQualityScoresContent repoFullName={selectedRepoFullName} />
    </RepositoryCheck>
  );
};

export default DeveloperQualityScores;