import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #3f51b5 30%, #f50057 90%)',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={6} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            DevInsights
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
            Developer analytics and insights for your GitHub repositories
          </Typography>
          
          <Outlet /> {/* This renders the auth pages */}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;