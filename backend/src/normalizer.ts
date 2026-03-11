import { PullRequest } from './types';

const BOT_LOGINS = new Set(['copilot', 'github-actions']);

function isBot(login: string): boolean {
  if (!login) return false;
  return login.endsWith('[bot]') || BOT_LOGINS.has(login.toLowerCase());
}

function mapReviewDecision(decision: string | null): PullRequest['reviewDecision'] {
  switch (decision) {
    case 'APPROVED': return 'approved';
    case 'CHANGES_REQUESTED': return 'changes_requested';
    case 'REVIEW_REQUIRED': return 'review_required';
    default: return 'none';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizePR(repoFullName: string, pr: any): PullRequest {
  const author = pr.author?.login ?? 'unknown';

  // Count approvals and change requests from reviews
  let approvals = 0;
  let changeRequests = 0;
  const reviewerSet = new Set<string>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const review of (pr.reviews?.nodes ?? [])) {
    const reviewerLogin = review.author?.login ?? '';
    if (isBot(reviewerLogin)) continue;
    if (reviewerLogin) reviewerSet.add(reviewerLogin);
    if (review.state === 'APPROVED') approvals++;
    if (review.state === 'CHANGES_REQUESTED') changeRequests++;
  }

  // Add requested reviewers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const request of (pr.reviewRequests?.nodes ?? [])) {
    const reqLogin = request.requestedReviewer?.login ?? request.requestedReviewer?.name ?? '';
    if (reqLogin && !isBot(reqLogin)) reviewerSet.add(reqLogin);
  }

  // Count unresolved and resolved review threads
  let unresolvedThreads = 0;
  let resolvedThreads = 0;
  let developerComments = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const thread of (pr.reviewThreads?.nodes ?? [])) {
    if (thread.isResolved) {
      resolvedThreads++;
    } else {
      unresolvedThreads++;
    }
    // Count comments in this thread by human developers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const comment of (thread.comments?.nodes ?? [])) {
      const commentLogin = comment.author?.login ?? '';
      if (!isBot(commentLogin)) {
        developerComments++;
      }
    }
  }

  // Also count non-review comments (issue-style comments on the PR)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const comment of (pr.comments?.nodes ?? [])) {
    const commentLogin = comment.author?.login ?? '';
    if (!isBot(commentLogin)) {
      developerComments++;
    }
  }

  return {
    repo: repoFullName,
    number: pr.number,
    title: pr.title,
    url: pr.url,
    author: isBot(author) ? 'unknown' : author,
    labels: (pr.labels?.nodes ?? []).map((l: { name: string }) => l.name),
    approvals,
    changeRequests,
    developerComments,
    unresolvedThreads,
    resolvedThreads,
    reviewDecision: mapReviewDecision(pr.reviewDecision),
    reviewers: Array.from(reviewerSet),
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
  };
}
