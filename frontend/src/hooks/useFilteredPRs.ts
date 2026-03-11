import { useMemo } from 'react';
import { PullRequest, SortOption } from '../types/pr';
import { useFilterStore } from '../store/filterStore';

function sortPRs(prs: PullRequest[], sortBy: SortOption): PullRequest[] {
  const sorted = [...prs];
  switch (sortBy) {
    case 'recently_updated':
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case 'recently_created':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'most_unresolved':
      return sorted.sort((a, b) => b.unresolvedThreads - a.unresolvedThreads);
    case 'most_activity':
      return sorted.sort((a, b) => b.developerComments - a.developerComments);
    case 'awaiting_review':
      return sorted.sort((a, b) => {
        const aWaiting = a.reviewDecision === 'review_required' ? 1 : 0;
        const bWaiting = b.reviewDecision === 'review_required' ? 1 : 0;
        return bWaiting - aWaiting;
      });
    case 'awaiting_qa':
      return sorted.sort((a, b) => {
        const aQA = a.labels.includes('pending qa') ? 1 : 0;
        const bQA = b.labels.includes('pending qa') ? 1 : 0;
        return bQA - aQA;
      });
    default:
      return sorted;
  }
}

export function useFilteredPRs(prs: PullRequest[]): PullRequest[] {
  const { teamLabels, workflowLabels, authors, reviewers, commentFilter, sortBy } = useFilterStore();

  return useMemo(() => {
    let filtered = prs;

    if (teamLabels.length > 0) {
      filtered = filtered.filter((pr) =>
        teamLabels.some((label) => pr.labels.includes(label))
      );
    }

    if (workflowLabels.length > 0) {
      filtered = filtered.filter((pr) =>
        workflowLabels.some((label) => pr.labels.includes(label))
      );
    }

    if (authors.length > 0) {
      filtered = filtered.filter((pr) => authors.includes(pr.author));
    }

    if (reviewers.length > 0) {
      filtered = filtered.filter((pr) =>
        reviewers.some((r) => pr.reviewers.includes(r))
      );
    }

    if (commentFilter === 'unresolved_only') {
      filtered = filtered.filter((pr) => pr.unresolvedThreads > 0);
    } else if (commentFilter === 'resolved_only') {
      filtered = filtered.filter((pr) => pr.resolvedThreads > 0 && pr.unresolvedThreads === 0);
    }

    return sortPRs(filtered, sortBy);
  }, [prs, teamLabels, workflowLabels, authors, reviewers, commentFilter, sortBy]);
}
