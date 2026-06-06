import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FamilyFriendService, FamilyFriendUser } from '@/services/familyFriendService';

export interface FamilyFriendFilters {
  search?: string;
  relationshipTypes?: string[];
  sortBy?: 'firstName' | 'lastName' | 'createdAt';
  sortDir?: 'asc' | 'desc';
  createdStart?: string;
  createdEnd?: string;
  createdInPastWeek?: boolean;
}

export const useFamilyFriends = () => {
  const [filters, setFilters] = useState<FamilyFriendFilters>({});

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['family-friends-admin'],
    queryFn: FamilyFriendService.fetchAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const all: FamilyFriendUser[] = data ?? [];

  const uniqueRelationshipTypes = useMemo(() => {
    const types = new Set<string>();
    for (const u of all) {
      if (u.relationship_type) types.add(u.relationship_type);
    }
    return Array.from(types).sort();
  }, [all]);

  const filtered = useMemo(() => {
    let result = [...all];

    const q = filters.search?.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (u) =>
          (u.full_name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.relationship_type || '').toLowerCase().includes(q) ||
          (u.hometown || '').toLowerCase().includes(q)
      );
    }

    if (filters.relationshipTypes && filters.relationshipTypes.length > 0) {
      result = result.filter(u => u.relationship_type && filters.relationshipTypes!.includes(u.relationship_type));
    }

    if (filters.createdInPastWeek) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter(u => u.created_at && new Date(u.created_at) >= sevenDaysAgo);
    }

    if (filters.createdStart) {
      const start = new Date(filters.createdStart + 'T00:00:00Z');
      result = result.filter(u => u.created_at && new Date(u.created_at) >= start);
    }

    if (filters.createdEnd) {
      const end = new Date(filters.createdEnd + 'T23:59:59Z');
      result = result.filter(u => u.created_at && new Date(u.created_at) <= end);
    }

    if (filters.sortBy) {
      result = [...result].sort((a, b) => {
        let aVal: string;
        let bVal: string;

        if (filters.sortBy === 'firstName') {
          aVal = (a.full_name || '').split(' ')[0].toLowerCase();
          bVal = (b.full_name || '').split(' ')[0].toLowerCase();
        } else if (filters.sortBy === 'lastName') {
          const aParts = (a.full_name || '').split(' ');
          const bParts = (b.full_name || '').split(' ');
          aVal = (aParts.length > 1 ? aParts.slice(1).join(' ') : aParts[0] || '').toLowerCase();
          bVal = (bParts.length > 1 ? bParts.slice(1).join(' ') : bParts[0] || '').toLowerCase();
        } else {
          aVal = a.created_at || '';
          bVal = b.created_at || '';
        }

        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return filters.sortDir === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }, [all, filters]);

  const updateFilters = (newFilters: FamilyFriendFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    users: filtered,
    allUsers: all,
    total: all.length,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    updateFilters,
    clearFilters,
    uniqueRelationshipTypes,
  };
};
