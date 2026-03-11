import React from 'react';
import Chip from '@mui/material/Chip';
import { PullRequest } from '../types/pr';

interface ReviewStatusChipProps {
  reviewDecision: PullRequest['reviewDecision'];
}

export function ReviewStatusChip({ reviewDecision }: ReviewStatusChipProps) {
  switch (reviewDecision) {
    case 'approved':
      return <Chip label="Approved" color="success" size="small" variant="outlined" />;
    case 'changes_requested':
      return <Chip label="Changes Requested" color="error" size="small" variant="outlined" />;
    case 'review_required':
      return <Chip label="Review Required" color="warning" size="small" variant="outlined" />;
    default:
      return <Chip label="No Decision" color="default" size="small" variant="outlined" />;
  }
}
