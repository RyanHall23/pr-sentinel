import { renderHook, act } from '@testing-library/react';
import { useFilterStore } from '../store/filterStore';

describe('filterStore', () => {
  beforeEach(() => {
    useFilterStore.getState().resetFilters();
  });

  it('has correct default state', () => {
    const state = useFilterStore.getState();
    expect(state.teamLabels).toEqual([]);
    expect(state.workflowLabels).toEqual([]);
    expect(state.authors).toEqual([]);
    expect(state.reviewers).toEqual([]);
    expect(state.commentFilter).toBe('all');
    expect(state.sortBy).toBe('recently_updated');
  });

  it('sets team labels', () => {
    act(() => {
      useFilterStore.getState().setTeamLabels(['team/frontend']);
    });
    expect(useFilterStore.getState().teamLabels).toEqual(['team/frontend']);
  });

  it('sets comment filter', () => {
    act(() => {
      useFilterStore.getState().setCommentFilter('unresolved_only');
    });
    expect(useFilterStore.getState().commentFilter).toBe('unresolved_only');
  });

  it('resets all filters', () => {
    act(() => {
      useFilterStore.getState().setTeamLabels(['team/backend']);
      useFilterStore.getState().setCommentFilter('resolved_only');
      useFilterStore.getState().setSortBy('most_unresolved');
    });
    act(() => {
      useFilterStore.getState().resetFilters();
    });
    const state = useFilterStore.getState();
    expect(state.teamLabels).toEqual([]);
    expect(state.commentFilter).toBe('all');
    expect(state.sortBy).toBe('recently_updated');
  });
});
