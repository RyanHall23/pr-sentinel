import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({ onRefresh, isRefreshing }: HeaderProps) {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
            🛡️ PR Sentinel
          </Typography>
        </Box>

        {isAuthenticated && user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Refresh pull requests">
              <span>
                <IconButton onClick={onRefresh} disabled={isRefreshing} size="small">
                  {isRefreshing ? (
                    <CircularProgress size={18} />
                  ) : (
                    <RefreshIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Avatar
              src={user.avatarUrl}
              alt={user.login}
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" fontWeight={500}>
              {user.login}
            </Typography>
            <Tooltip title="Sign out">
              <IconButton onClick={logout} size="small">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={login}
            startIcon={<span>🐙</span>}
            sx={{ textTransform: 'none' }}
          >
            Sign in with GitHub
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
