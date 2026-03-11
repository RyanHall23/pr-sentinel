import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          🛡️ PR Sentinel
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Monitor your pull requests across repositories. Sign in with GitHub to get started.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={login}
          fullWidth
          sx={{ textTransform: 'none', py: 1.5, fontWeight: 600 }}
        >
          🐙 Sign in with GitHub
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Requires repo, read:org, and read:user permissions
        </Typography>
      </Paper>
    </Box>
  );
}
