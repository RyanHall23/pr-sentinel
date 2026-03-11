import React from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { useFilterStore } from '../store/filterStore';
import { PullRequest, SortOption, CommentFilter } from '../types/pr';

const TEAM_LABELS = ['team/frontend', 'team/backend', 'team/mobile'];
const WORKFLOW_LABELS = ['pending review', 'pending qa', 'ready to merge'];

interface FilterBarProps {
  prs: PullRequest[];
}

export function FilterBar({ prs }: FilterBarProps) {
  const {
    teamLabels,
    workflowLabels,
    authors,
    reviewers,
    commentFilter,
    sortBy,
    setTeamLabels,
    setWorkflowLabels,
    setAuthors,
    setReviewers,
    setCommentFilter,
    setSortBy,
    resetFilters,
  } = useFilterStore();

  // Derive available authors and reviewers from loaded PRs
  const availableAuthors = [...new Set(prs.map((pr) => pr.author))].sort();
  const availableReviewers = [...new Set(prs.flatMap((pr) => pr.reviewers))].sort();

  const hasActiveFilters =
    teamLabels.length > 0 ||
    workflowLabels.length > 0 ||
    authors.length > 0 ||
    reviewers.length > 0 ||
    commentFilter !== 'all' ||
    sortBy !== 'recently_updated';

  function handleMultiSelect(
    event: SelectChangeEvent<string[]>,
    setter: (v: string[]) => void
  ) {
    const value = event.target.value;
    setter(typeof value === 'string' ? value.split(',') : value);
  }

  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontWeight: 600 }}>
        Filters
      </Typography>

      {/* Team Label Filter */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Team</InputLabel>
        <Select
          multiple
          value={teamLabels}
          onChange={(e) => handleMultiSelect(e, setTeamLabels)}
          input={<OutlinedInput label="Team" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((val) => (
                <Chip key={val} label={val.replace('team/', '')} size="small" />
              ))}
            </Box>
          )}
        >
          {TEAM_LABELS.map((label) => (
            <MenuItem key={label} value={label}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Workflow Label Filter */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Workflow</InputLabel>
        <Select
          multiple
          value={workflowLabels}
          onChange={(e) => handleMultiSelect(e, setWorkflowLabels)}
          input={<OutlinedInput label="Workflow" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((val) => (
                <Chip key={val} label={val} size="small" color="primary" variant="outlined" />
              ))}
            </Box>
          )}
        >
          {WORKFLOW_LABELS.map((label) => (
            <MenuItem key={label} value={label}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Author Filter */}
      {availableAuthors.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Author</InputLabel>
          <Select
            multiple
            value={authors}
            onChange={(e) => handleMultiSelect(e, setAuthors)}
            input={<OutlinedInput label="Author" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((val) => (
                  <Chip key={val} label={val} size="small" />
                ))}
              </Box>
            )}
          >
            {availableAuthors.map((author) => (
              <MenuItem key={author} value={author}>{author}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Reviewer Filter */}
      {availableReviewers.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Reviewer</InputLabel>
          <Select
            multiple
            value={reviewers}
            onChange={(e) => handleMultiSelect(e, setReviewers)}
            input={<OutlinedInput label="Reviewer" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((val) => (
                  <Chip key={val} label={val} size="small" />
                ))}
              </Box>
            )}
          >
            {availableReviewers.map((reviewer) => (
              <MenuItem key={reviewer} value={reviewer}>{reviewer}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Divider orientation="vertical" flexItem />

      {/* Comment Status Filter */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Comment Status</InputLabel>
        <Select
          value={commentFilter}
          onChange={(e) => setCommentFilter(e.target.value as CommentFilter)}
          input={<OutlinedInput label="Comment Status" />}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="unresolved_only">Unresolved Only</MenuItem>
          <MenuItem value="resolved_only">Resolved Only</MenuItem>
        </Select>
      </FormControl>

      {/* Sort By */}
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          input={<OutlinedInput label="Sort By" />}
        >
          <MenuItem value="recently_updated">Recently Updated</MenuItem>
          <MenuItem value="recently_created">Recently Created</MenuItem>
          <MenuItem value="most_unresolved">Most Unresolved Comments</MenuItem>
          <MenuItem value="most_activity">Most Developer Activity</MenuItem>
          <MenuItem value="awaiting_review">Awaiting Review</MenuItem>
          <MenuItem value="awaiting_qa">Awaiting QA</MenuItem>
        </Select>
      </FormControl>

      {hasActiveFilters && (
        <Button size="small" variant="outlined" onClick={resetFilters} sx={{ textTransform: 'none' }}>
          Clear Filters
        </Button>
      )}
    </Box>
  );
}
