import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        width: '100vw',      // span full viewport width
        height: '100vh',     // span full viewport height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #3f51b5 30%, #f50057 90%)',
      }}
    >
      <Container
        maxWidth={false}      // make container fluid
        disableGutters        // remove default side padding
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: 2,               // optional horizontal padding
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: '100%',      // fill its parent’s width
            maxWidth: 400,      // cap the form width
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            DevInsights
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
            Developer analytics and insights for your GitHub repositories
          </Typography>

          <Outlet /> {/* Renders your login/signup pages */}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
