import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { PullRequest } from '../types/pr';

interface PRResponse {
  data: PullRequest[];
  cached: boolean;
}

async function fetchPRs(): Promise<PullRequest[]> {
  const res = await axios.get<PRResponse>('/api/prs', { withCredentials: true });
  return res.data.data;
}

async function refreshPRs(csrfToken: string): Promise<PullRequest[]> {
  const res = await axios.post<PRResponse>('/api/prs/refresh', {}, {
    withCredentials: true,
    headers: { 'x-csrf-token': csrfToken },
  });
  return res.data.data;
}

export function usePRs() {
  const queryClient = useQueryClient();

  const { data: csrfToken = '' } = useQuery<string>({
    queryKey: ['auth', 'csrf'],
    staleTime: Infinity,
  });

  const { data: prs = [], isLoading, isError, error } = useQuery<PullRequest[]>({
    queryKey: ['prs'],
    queryFn: fetchPRs,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const refreshMutation = useMutation({
    mutationFn: () => refreshPRs(csrfToken),
    onSuccess: (data) => {
      queryClient.setQueryData(['prs'], data);
    },
  });

  return {
    prs,
    isLoading,
    isError,
    error,
    refresh: () => refreshMutation.mutate(),
    isRefreshing: refreshMutation.isPending,
  };
}
