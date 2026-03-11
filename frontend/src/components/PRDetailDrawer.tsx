import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Chip,
  Link,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CommentIcon from '@mui/icons-material/Comment';
import PersonIcon from '@mui/icons-material/Person';
import { PullRequest } from '../types/pr';
import { ReviewStatusChip } from './ReviewStatusChip';

interface PRDetailDrawerProps {
  pr: PullRequest | null;
  onClose: () => void;
}

function getWorkflowLabel(labels: string[]): string | undefined {
  const workflowLabels = ['pending review', 'pending qa', 'ready to merge'];
  return labels.find((l) => workflowLabels.includes(l));
}

export function PRDetailDrawer({ pr, onClose }: PRDetailDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={!!pr}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 480 } } }}
    >
      {pr && (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start', gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {pr.repo} #{pr.number}
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.5, lineHeight: 1.3, fontSize: '1rem' }}>
                <Link
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  underline="hover"
                >
                  {pr.title}
                </Link>
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ mt: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
            {/* Author and Review Status */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={600}>{pr.author}</Typography>
              </Box>
              <ReviewStatusChip reviewDecision={pr.reviewDecision} />
            </Stack>

            {/* Labels */}
            {pr.labels.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                  LABELS
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {pr.labels.map((label) => {
                    const colorMap: Record<string, 'primary' | 'warning' | 'info' | 'success' | 'default'> = {
                      'pending review': 'warning',
                      'pending qa': 'info',
                      'ready to merge': 'success',
                    };
                    const isTeam = label.startsWith('team/');
                    return (
                      <Chip
                        key={label}
                        label={label}
                        size="small"
                        color={colorMap[label] ?? (isTeam ? 'primary' : 'default')}
                        variant="outlined"
                      />
                    );
                  })}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Review Summary */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                REVIEW SUMMARY
              </Typography>
              <Stack direction="row" spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircleOutlineIcon fontSize="small" color="success" />
                  <Typography variant="body2">{pr.approvals} approval{pr.approvals !== 1 ? 's' : ''}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <ErrorOutlineIcon fontSize="small" color="error" />
                  <Typography variant="body2">{pr.changeRequests} change{pr.changeRequests !== 1 ? 's' : ''} requested</Typography>
                </Box>
              </Stack>
            </Box>

            {/* Reviewers */}
            {pr.reviewers.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                  REVIEWERS
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {pr.reviewers.map((reviewer) => (
                    <Chip key={reviewer} label={reviewer} size="small" icon={<PersonIcon />} variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Thread Summary */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                REVIEW THREADS
              </Typography>
              <Stack direction="row" spacing={3}>
                <Tooltip title="Unresolved threads need attention">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <ErrorOutlineIcon fontSize="small" color={pr.unresolvedThreads > 0 ? 'error' : 'disabled'} />
                    <Typography
                      variant="body2"
                      color={pr.unresolvedThreads > 0 ? 'error.main' : 'text.secondary'}
                      fontWeight={pr.unresolvedThreads > 0 ? 700 : 400}
                    >
                      {pr.unresolvedThreads} unresolved
                    </Typography>
                  </Box>
                </Tooltip>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircleOutlineIcon fontSize="small" color="success" />
                  <Typography variant="body2" color="text.secondary">
                    {pr.resolvedThreads} resolved
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Developer Comments */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                DEVELOPER COMMENTS
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CommentIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {pr.developerComments} human comment{pr.developerComments !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Workflow */}
            {getWorkflowLabel(pr.labels) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                  WORKFLOW STATUS
                </Typography>
                <Chip
                  label={getWorkflowLabel(pr.labels)}
                  size="small"
                  color={
                    getWorkflowLabel(pr.labels) === 'ready to merge'
                      ? 'success'
                      : getWorkflowLabel(pr.labels) === 'pending qa'
                      ? 'info'
                      : 'warning'
                  }
                />
              </Box>
            )}

            {/* Timestamps */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                ACTIVITY
              </Typography>
              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Created"
                    secondary={new Date(pr.createdAt).toLocaleString()}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Last Updated"
                    secondary={new Date(pr.updatedAt).toLocaleString()}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
