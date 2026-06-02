import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FamilyFriendService, FamilyFriendUser } from '@/services/familyFriendService';

export const useFamilyFriends = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['family-friends-admin'],
    queryFn: FamilyFriendService.fetchAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const all: FamilyFriendUser[] = data ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (u) =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.relationship_type || '').toLowerCase().includes(q) ||
        (u.hometown || '').toLowerCase().includes(q)
    );
  }, [all, search]);

  return { users: filtered, total: all.length, isLoading, isError, error, refetch, search, setSearch };
};
