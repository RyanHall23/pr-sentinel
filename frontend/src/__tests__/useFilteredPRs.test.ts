import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useFilteredPRs } from '../hooks/useFilteredPRs';
import { useFilterStore } from '../store/filterStore';
import { PullRequest } from '../types/pr';

const mockPRs: PullRequest[] = [
  {
    repo: 'org/frontend',
    number: 1,
    title: 'Feature A',
    url: 'https://github.com/org/frontend/pull/1',
    author: 'alice',
    labels: ['team/frontend', 'pending review'],
    approvals: 1,
    changeRequests: 0,
    developerComments: 2,
    unresolvedThreads: 1,
    resolvedThreads: 0,
    reviewDecision: 'review_required',
    reviewers: ['bob'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    repo: 'org/backend',
    number: 2,
    title: 'Fix B',
    url: 'https://github.com/org/backend/pull/2',
    author: 'charlie',
    labels: ['team/backend', 'pending qa'],
    approvals: 2,
    changeRequests: 0,
    developerComments: 5,
    unresolvedThreads: 0,
    resolvedThreads: 3,
    reviewDecision: 'approved',
    reviewers: ['alice', 'dave'],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
];

describe('useFilteredPRs', () => {
  beforeEach(() => {
    useFilterStore.getState().resetFilters();
  });

  it('returns all PRs when no filters active', () => {
    const { result } = renderHook(() => useFilteredPRs(mockPRs));
    expect(result.current).toHaveLength(2);
  });

  it('filters by team label', () => {
    act(() => {
      useFilterStore.getState().setTeamLabels(['team/frontend']);
    });
    const { result } = renderHook(() => useFilteredPRs(mockPRs));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].number).toBe(1);
  });

  it('filters by author', () => {
    act(() => {
      useFilterStore.getState().setAuthors(['charlie']);
    });
    const { result } = renderHook(() => useFilteredPRs(mockPRs));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].number).toBe(2);
  });

  it('filters unresolved only', () => {
    act(() => {
      useFilterStore.getState().setCommentFilter('unresolved_only');
    });
    const { result } = renderHook(() => useFilteredPRs(mockPRs));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].unresolvedThreads).toBeGreaterThan(0);
  });

  it('sorts by most unresolved', () => {
    act(() => {
      useFilterStore.getState().setSortBy('most_unresolved');
    });
    const { result } = renderHook(() => useFilteredPRs(mockPRs));
    expect(result.current[0].unresolvedThreads).toBeGreaterThanOrEqual(
      result.current[1].unresolvedThreads
    );
  });
});
