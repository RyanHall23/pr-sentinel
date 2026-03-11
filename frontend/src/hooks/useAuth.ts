import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { User } from '../types/pr';

async function fetchMe(): Promise<User> {
  const res = await axios.get<User>('/auth/me', { withCredentials: true });
  return res.data;
}

async function fetchCsrfToken(): Promise<string> {
  const res = await axios.get<{ csrfToken: string }>('/auth/csrf-token', { withCredentials: true });
  return res.data.csrfToken;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: csrfToken } = useQuery<string>({
    queryKey: ['auth', 'csrf'],
    queryFn: fetchCsrfToken,
    staleTime: Infinity,
  });

  const logoutMutation = useMutation({
    mutationFn: () =>
      axios.post('/auth/logout', {}, {
        withCredentials: true,
        headers: { 'x-csrf-token': csrfToken ?? '' },
      }),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user: isError ? null : user,
    isLoading,
    isAuthenticated: !isError && !!user,
    login: () => { window.location.href = '/auth/github'; },
    logout: () => logoutMutation.mutate(),
  };
}
