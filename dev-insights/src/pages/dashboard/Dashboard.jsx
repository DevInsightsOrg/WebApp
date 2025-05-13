import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import RepositoryCheck from '../../components/repository/RepositoryCheck';
import { useNavigate } from 'react-router-dom';
import { useRepo } from '../../context/RepoContext';
import DashboardContent from './DashboardContent';

const Dashboard = () => {
  const { selectedRepoFullName } = useRepo();
  const navigate = useNavigate();

  if (!selectedRepoFullName) {
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

  return (
    <RepositoryCheck repoFullName={selectedRepoFullName}>
      <DashboardContent repoFullName={selectedRepoFullName} />
    </RepositoryCheck>
  );
};

export default Dashboard;