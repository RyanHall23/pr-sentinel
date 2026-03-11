export interface PullRequest {
  repo: string;
  number: number;
  title: string;
  url: string;
  author: string;
  labels: string[];
  approvals: number;
  changeRequests: number;
  developerComments: number;
  unresolvedThreads: number;
  resolvedThreads: number;
  reviewDecision: 'approved' | 'changes_requested' | 'review_required' | 'none';
  reviewers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionData {
  accessToken?: string;
  userLogin?: string;
  userAvatarUrl?: string;
}
