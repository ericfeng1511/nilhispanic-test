import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { StudentAthleteService } from '@/services/studentAthleteService';
import { StudentAthlete, StudentAthleteFilters, PaginatedStudentAthletes } from '@/types/studentAthlete';

export const useStudentAthletes = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(100); // Fixed at 100 as per requirements
  const [filters, setFilters] = useState<StudentAthleteFilters>({});

  // Fetch and cache all student athletes
  const {
    data: queryData,
    isLoading,
    error,
    isError,
    refetch
  } = useQuery({
    queryKey: ['student-athletes'],
    queryFn: StudentAthleteService.fetchAllStudentAthletes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Use a stable empty array reference to avoid changing identity on each render
  const EMPTY_ATHLETES: StudentAthlete[] = useMemo(() => [], []);
  const allAthletes: StudentAthlete[] = queryData ?? EMPTY_ATHLETES;

  // Get paginated results from cached data
  const paginatedResults: PaginatedStudentAthletes = useMemo(() => {
    if (!allAthletes.length) {
      return {
        data: [],
        total: 0,
        page: currentPage,
        pageSize,
        totalPages: 0
      };
    }

    return StudentAthleteService.getPaginatedAthletes(
      allAthletes,
      currentPage,
      pageSize,
      filters
    );
  }, [allAthletes, currentPage, pageSize, filters]);

  // Get unique sports for filter dropdown
  const uniqueSports = useMemo(() => {
    return StudentAthleteService.getUniqueSports(allAthletes);
  }, [allAthletes]);

  // Get unique colleges for filter dropdown
  const uniqueColleges = useMemo(() => {
    return StudentAthleteService.getUniqueColleges(allAthletes);
  }, [allAthletes]);

  // Get unique genders for filter dropdown
  const uniqueGenders = useMemo(() => {
    return StudentAthleteService.getUniqueGenders(allAthletes);
  }, [allAthletes]);

  // Get unique years for filter dropdown
  const uniqueYears = useMemo(() => {
    return StudentAthleteService.getUniqueYears(allAthletes);
  }, [allAthletes]);

  // Get unique social media ranges for filter dropdown
  const uniqueTotalSmRanges = useMemo(() => {
    return StudentAthleteService.getUniqueTotalSmRanges(allAthletes);
  }, [allAthletes]);

  // Navigation functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginatedResults.totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < paginatedResults.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Filter functions
  const updateFilters = (newFilters: StudentAthleteFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  return {
    // Data
    athletes: paginatedResults.data,
    allAthletes,
    totalAthletes: paginatedResults.total,
    currentPage: paginatedResults.page,
    pageSize: paginatedResults.pageSize,
    totalPages: paginatedResults.totalPages,
    
    // Filter options
    uniqueSports,
    uniqueColleges,
    uniqueGenders,
    uniqueYears,
    uniqueTotalSmRanges,
    filters,
    
    // Loading states
    isLoading,
    isError,
    error,
    
    // Actions
    goToPage,
    goToNextPage,
    goToPreviousPage,
    updateFilters,
    clearFilters,
    refetch,
    
    // Computed states
    hasNextPage: currentPage < paginatedResults.totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === paginatedResults.totalPages,
  };
};
