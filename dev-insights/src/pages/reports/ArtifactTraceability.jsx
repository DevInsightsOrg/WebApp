// ArtifactTraceability.jsx
import React from 'react';
import RepositoryCheck from '../../components/repository/RepositoryCheck';
import TraceabilityContent from './Traceability';
import { useRepo } from '../../context/RepoContext';

const ArtifactTraceability = () => {
  const { selectedRepoFullName } = useRepo();

  if (!selectedRepoFullName) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please select a repository to view artifact traceability.
        </Alert>
      </Box>
    );
  }

  return (
    <RepositoryCheck repoFullName={selectedRepoFullName}>
      {/* only mounts TraceabilityContent after processed */}
      <TraceabilityContent repoFullName={selectedRepoFullName} />
    </RepositoryCheck>
  );
};

export default ArtifactTraceability;
