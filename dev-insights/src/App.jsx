import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout Components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import OAuthCallback from './pages/auth/OAuthCallback';

// Main Pages
import Dashboard from './pages/dashboard/Dashboard';
import DevelopersList from './pages/developers/DevelopersList';
import DeveloperProfile from './pages/developers/DeveloperProfile';
import ArtifactTraceability from './pages/reports/ArtifactTraceability';
import DeveloperHeatmap from './pages/reports/DeveloperHeatmap';
import IssuesTracking from './pages/IssuesTracking';
import Repositories from './pages/settings/Repositories';
import Settings from './pages/settings/Settings';
import ContributorsPage from './pages/ContributorsPage';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { RepoProvider } from './context/RepoContext';

// Define theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
  };

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RepoProvider>
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />
              </Route>
              
              {/* Protected Routes */}
              <Route element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<Dashboard />} />
                <Route path="/developers" element={<DevelopersList />} />
                <Route path="/developers/:id" element={<DeveloperProfile />} />
                <Route path="/reports/traceability" element={<ArtifactTraceability />} />
                <Route path="/reports/heatmap" element={<DeveloperHeatmap />} />
                <Route path="/issues" element={<IssuesTracking />} />
                <Route path="/settings/repositories" element={<Repositories />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/code-contribution-analysis" element={<ContributorsPage />} />
              </Route>
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </RepoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;