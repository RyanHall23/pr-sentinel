import axios from 'axios';
import { normalizePR } from './normalizer';
import { PullRequest } from './types';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const PR_FIELDS = `
  number
  title
  url
  createdAt
  updatedAt
  reviewDecision
  author { login }
  labels(first: 20) {
    nodes { name }
  }
  reviews(first: 50) {
    nodes {
      state
      author { login }
      submittedAt
    }
  }
  reviewRequests(first: 20) {
    nodes {
      requestedReviewer {
        ... on User { login }
        ... on Team { name }
      }
    }
  }
  reviewThreads(first: 50) {
    nodes {
      isResolved
      comments(first: 20) {
        nodes {
          author { login }
          createdAt
          body
        }
      }
    }
  }
  comments(first: 50) {
    nodes {
      author { login }
      createdAt
    }
  }
`;

export async function fetchPRsForRepo(
  accessToken: string,
  owner: string,
  name: string,
  first = 50
): Promise<PullRequest[]> {
  const query = `
    query($owner: String!, $name: String!, $first: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequests(first: $first, states: [OPEN], orderBy: { field: UPDATED_AT, direction: DESC }) {
          nodes {
            ${PR_FIELDS}
          }
        }
      }
    }
  `;

  const response = await axios.post(
    GITHUB_GRAPHQL_URL,
    { query, variables: { owner, name, first } },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.data.errors) {
    throw new Error(
      `GraphQL errors for ${owner}/${name}: ${JSON.stringify(response.data.errors)}`
    );
  }

  const repoData = response.data?.data?.repository;
  if (!repoData) return [];

  const repoFullName = `${owner}/${name}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (repoData.pullRequests?.nodes ?? []).map((pr: any) =>
    normalizePR(repoFullName, pr)
  );
}

export async function fetchAllPRs(
  accessToken: string,
  repositories: string[]
): Promise<PullRequest[]> {
  const results = await Promise.allSettled(
    repositories.map((repo) => {
      const [owner, name] = repo.split('/');
      if (!owner || !name) return Promise.resolve([]);
      return fetchPRsForRepo(accessToken, owner, name);
    })
  );

  const prs: PullRequest[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      prs.push(...result.value);
    }
  }
  return prs;
}
