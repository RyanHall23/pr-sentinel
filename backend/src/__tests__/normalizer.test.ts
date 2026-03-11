import { normalizePR } from '../normalizer';

describe('normalizePR', () => {
  const basePR = {
    number: 42,
    title: 'Fix login bug',
    url: 'https://github.com/org/repo/pull/42',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    reviewDecision: 'APPROVED',
    author: { login: 'alice' },
    labels: { nodes: [{ name: 'team/frontend' }] },
    reviews: {
      nodes: [
        { state: 'APPROVED', author: { login: 'bob' }, submittedAt: '2024-01-02T00:00:00Z' },
        { state: 'CHANGES_REQUESTED', author: { login: 'charlie' }, submittedAt: '2024-01-02T00:00:00Z' },
      ],
    },
    reviewRequests: {
      nodes: [
        { requestedReviewer: { login: 'dave' } },
      ],
    },
    reviewThreads: {
      nodes: [
        {
          isResolved: false,
          comments: {
            nodes: [
              { author: { login: 'alice' }, createdAt: '2024-01-02T00:00:00Z', body: 'comment' },
              { author: { login: 'dependabot[bot]' }, createdAt: '2024-01-02T00:00:00Z', body: 'bot comment' },
            ],
          },
        },
        {
          isResolved: true,
          comments: {
            nodes: [
              { author: { login: 'bob' }, createdAt: '2024-01-02T00:00:00Z', body: 'resolved' },
            ],
          },
        },
      ],
    },
    comments: {
      nodes: [
        { author: { login: 'alice' }, createdAt: '2024-01-02T00:00:00Z' },
        { author: { login: 'github-actions' }, createdAt: '2024-01-02T00:00:00Z' },
      ],
    },
  };

  it('normalizes basic PR fields', () => {
    const pr = normalizePR('org/repo', basePR);
    expect(pr.repo).toBe('org/repo');
    expect(pr.number).toBe(42);
    expect(pr.title).toBe('Fix login bug');
    expect(pr.url).toBe('https://github.com/org/repo/pull/42');
    expect(pr.author).toBe('alice');
  });

  it('normalizes labels', () => {
    const pr = normalizePR('org/repo', basePR);
    expect(pr.labels).toEqual(['team/frontend']);
  });

  it('counts approvals and change requests, excluding bots', () => {
    const pr = normalizePR('org/repo', basePR);
    expect(pr.approvals).toBe(1);
    expect(pr.changeRequests).toBe(1);
  });

  it('collects human reviewers', () => {
    const pr = normalizePR('org/repo', basePR);
    expect(pr.reviewers).toContain('bob');
    expect(pr.reviewers).toContain('charlie');
    expect(pr.reviewers).toContain('dave');
  });

  it('counts unresolved and resolved threads', () => {
    const pr = normalizePR('org/repo', basePR);
    expect(pr.unresolvedThreads).toBe(1);
    expect(pr.resolvedThreads).toBe(1);
  });

  it('counts developer comments excluding bots', () => {
    const pr = normalizePR('org/repo', basePR);
    // 1 human comment in unresolved thread + 1 in resolved = 2
    // 1 human PR comment = 1
    // total = 3
    expect(pr.developerComments).toBe(3);
  });

  it('maps review decision correctly', () => {
    const pr = normalizePR('org/repo', basePR);
    expect(pr.reviewDecision).toBe('approved');
  });

  it('handles bot author with fallback', () => {
    const botPR = { ...basePR, author: { login: 'dependabot[bot]' } };
    const pr = normalizePR('org/repo', botPR);
    expect(pr.author).toBe('unknown');
  });

  it('handles missing optional fields gracefully', () => {
    const minimalPR = {
      number: 1,
      title: 'Test',
      url: 'https://github.com/org/repo/pull/1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      reviewDecision: null,
      author: { login: 'alice' },
      labels: { nodes: [] },
      reviews: { nodes: [] },
      reviewRequests: { nodes: [] },
      reviewThreads: { nodes: [] },
      comments: { nodes: [] },
    };
    const pr = normalizePR('org/repo', minimalPR);
    expect(pr.approvals).toBe(0);
    expect(pr.unresolvedThreads).toBe(0);
    expect(pr.developerComments).toBe(0);
    expect(pr.reviewDecision).toBe('none');
  });
});
