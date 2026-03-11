import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Alert, Snackbar } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { PRTable } from './components/PRTable';
import { PRDetailDrawer } from './components/PRDetailDrawer';
import { LoginPage } from './components/LoginPage';
import { useAuth } from './hooks/useAuth';
import { usePRs } from './hooks/usePRs';
import { useFilteredPRs } from './hooks/useFilteredPRs';
import { PullRequest } from './types/pr';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a73e8' },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0 },
    },
  },
});

function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { prs, isLoading, isError, refresh, isRefreshing } = usePRs();
  const filteredPRs = useFilteredPRs(prs);
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);

  if (authLoading) return null;
  if (!isAuthenticated) return <LoginPage />;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header onRefresh={refresh} isRefreshing={isRefreshing} />
      <FilterBar prs={prs} />
      <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
        <PRTable
          prs={filteredPRs}
          isLoading={isLoading}
          onRowClick={setSelectedPR}
        />
      </Box>
      <PRDetailDrawer pr={selectedPR} onClose={() => setSelectedPR(null)} />
      {isError && (
        <Snackbar open autoHideDuration={6000}>
          <Alert severity="error" sx={{ width: '100%' }}>
            Failed to load pull requests. Make sure you have access to the configured repositories.
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Dashboard />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
