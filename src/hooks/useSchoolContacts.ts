import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SchoolContact, SchoolContactFilters } from '@/types/schoolContact';
import { SchoolContactService } from '@/services/schoolContactService';

const CONTACTS_PER_PAGE = 100;

export const useSchoolContacts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SchoolContactFilters>({});

  // Fetch all contacts and cache them
  const {
    data: allContacts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['school-contacts'],
    queryFn: async () => {
      console.log('🔄 Fetching school contacts from Supabase...');
      const result = await SchoolContactService.fetchAllSchoolContacts();
      console.log('📊 School contacts fetched:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Use service to get paginated and filtered data
  const paginatedResult = useMemo(() => {
    if (!allContacts.length) {
      return {
        data: [],
        total: 0,
        page: currentPage,
        pageSize: CONTACTS_PER_PAGE,
        totalPages: 0
      };
    }

    return SchoolContactService.getPaginatedContacts(
      allContacts,
      currentPage,
      CONTACTS_PER_PAGE,
      filters
    );
  }, [allContacts, currentPage, filters]);

  // Extract data from paginated result
  const paginatedContacts = paginatedResult.data;
  const totalContacts = paginatedResult.total;
  const totalPages = paginatedResult.totalPages;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Get unique values for filters
  const uniqueColleges = useMemo(() => {
    return SchoolContactService.getUniqueColleges(allContacts);
  }, [allContacts]);

  const uniqueTitles = useMemo(() => {
    return SchoolContactService.getUniqueTitles(allContacts);
  }, [allContacts]);

  // Navigation functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const updateFilters = (newFilters: Partial<SchoolContactFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  return {
    // Data
    contacts: paginatedContacts,
    allContacts,
    totalContacts,
    
    // Pagination
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    
    // Filtering
    filters,
    updateFilters,
    clearFilters,
    uniqueColleges,
    uniqueTitles,
    
    // Loading states
    isLoading,
    isError,
    error,
    refetch,
  };
};
