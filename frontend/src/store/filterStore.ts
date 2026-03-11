import { create } from 'zustand';
import { SortOption, CommentFilter } from '../types/pr';

interface FilterState {
  teamLabels: string[];
  workflowLabels: string[];
  authors: string[];
  reviewers: string[];
  commentFilter: CommentFilter;
  sortBy: SortOption;
  setTeamLabels: (labels: string[]) => void;
  setWorkflowLabels: (labels: string[]) => void;
  setAuthors: (authors: string[]) => void;
  setReviewers: (reviewers: string[]) => void;
  setCommentFilter: (filter: CommentFilter) => void;
  setSortBy: (sort: SortOption) => void;
  resetFilters: () => void;
}

const defaultState = {
  teamLabels: [] as string[],
  workflowLabels: [] as string[],
  authors: [] as string[],
  reviewers: [] as string[],
  commentFilter: 'all' as CommentFilter,
  sortBy: 'recently_updated' as SortOption,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...defaultState,
  setTeamLabels: (labels) => set({ teamLabels: labels }),
  setWorkflowLabels: (labels) => set({ workflowLabels: labels }),
  setAuthors: (authors) => set({ authors }),
  setReviewers: (reviewers) => set({ reviewers }),
  setCommentFilter: (filter) => set({ commentFilter: filter }),
  setSortBy: (sort) => set({ sortBy: sort }),
  resetFilters: () => set(defaultState),
}));
