import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Box,
  Link,
  Chip,
  Typography,
  Tooltip,
} from '@mui/material';
import { PullRequest } from '../types/pr';
import { ReviewStatusChip } from './ReviewStatusChip';

interface PRTableProps {
  prs: PullRequest[];
  isLoading: boolean;
  onRowClick: (pr: PullRequest) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getTeamLabel(labels: string[]): string {
  return labels.find((l) => l.startsWith('team/')) ?? '';
}

function getWorkflowLabel(labels: string[]): string {
  const workflowLabels = ['pending review', 'pending qa', 'ready to merge'];
  return labels.find((l) => workflowLabels.includes(l)) ?? '';
}

export function PRTable({ prs, isLoading, onRowClick }: PRTableProps) {
  const rows = prs.map((pr) => ({ ...pr, id: `${pr.repo}#${pr.number}` }));

  const columns: GridColDef[] = [
    {
      field: 'repo',
      headerName: 'Repository',
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" noWrap title={params.value as string}>
          {params.value as string}
        </Typography>
      ),
    },
    {
      field: 'number',
      headerName: 'PR #',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Link
          href={params.row.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          sx={{ fontWeight: 600 }}
        >
          #{params.value as number}
        </Link>
      ),
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value as string}>
          <Typography variant="body2" noWrap>
            {params.value as string}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'author',
      headerName: 'Author',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value as string}</Typography>
      ),
    },
    {
      field: 'teamLabel',
      headerName: 'Team',
      width: 130,
      valueGetter: (params) => getTeamLabel((params.row as PullRequest).labels),
      renderCell: (params: GridRenderCellParams) => {
        const label = params.value as string;
        return label ? (
          <Chip label={label.replace('team/', '')} size="small" variant="outlined" color="primary" />
        ) : null;
      },
    },
    {
      field: 'approvals',
      headerName: 'Approvals',
      width: 90,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" color={params.value > 0 ? 'success.main' : 'text.secondary'}>
            ✓ {params.value as number}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'unresolvedThreads',
      headerName: 'Unresolved',
      width: 100,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          color={params.value > 0 ? 'error.main' : 'text.secondary'}
          fontWeight={params.value > 0 ? 700 : 400}
        >
          {params.value as number}
        </Typography>
      ),
    },
    {
      field: 'resolvedThreads',
      headerName: 'Resolved',
      width: 90,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {params.value as number}
        </Typography>
      ),
    },
    {
      field: 'developerComments',
      headerName: 'Dev Comments',
      width: 120,
      type: 'number',
    },
    {
      field: 'reviewDecision',
      headerName: 'Review Status',
      width: 155,
      renderCell: (params: GridRenderCellParams) => (
        <ReviewStatusChip reviewDecision={params.value as PullRequest['reviewDecision']} />
      ),
    },
    {
      field: 'workflowLabel',
      headerName: 'Workflow',
      width: 140,
      valueGetter: (params) => getWorkflowLabel((params.row as PullRequest).labels),
      renderCell: (params: GridRenderCellParams) => {
        const label = params.value as string;
        if (!label) return null;
        const colorMap: Record<string, 'warning' | 'info' | 'success'> = {
          'pending review': 'warning',
          'pending qa': 'info',
          'ready to merge': 'success',
        };
        return (
          <Chip
            label={label}
            size="small"
            color={colorMap[label] ?? 'default'}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'updatedAt',
      headerName: 'Last Updated',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={new Date(params.value as string).toLocaleString()}>
          <Typography variant="body2" color="text.secondary">
            {formatDate(params.value as string)}
          </Typography>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 220px)', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        onRowClick={(params) => onRowClick(params.row as PullRequest)}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 300 },
          },
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'background.paper',
            borderBottom: '2px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-cell': {
            borderColor: 'divider',
          },
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
}
