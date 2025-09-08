import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { StudentAthleteService } from '@/services/studentAthleteService';
import { StudentAthlete, StudentAthleteFilters, PaginatedStudentAthletes } from '@/types/studentAthlete';
import { CollegeService } from '@/services/collegeService';

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

  // Build a list of school_ids present in the dataset
  const schoolIds = useMemo(() => {
    const ids = new Set<number>();
    for (const a of allAthletes) {
      if (typeof a.school_id === 'number') ids.add(a.school_id);
    }
    return Array.from(ids);
  }, [allAthletes]);

  // Fetch school names for those ids (bulk)
  const { data: schools = [] } = useQuery({
    queryKey: ['schools-by-ids', schoolIds],
    queryFn: () => CollegeService.getSchoolsByIds(schoolIds),
    enabled: schoolIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Build id->name map
  const schoolIdToName = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of schools) {
      if (s && typeof s.id === 'number' && s.name) map[s.id] = s.name;
    }
    return map;
  }, [schools]);

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
      filters,
      { schoolIdToName }
    );
  }, [allAthletes, currentPage, pageSize, filters, schoolIdToName]);

  // Get unique sports for filter dropdown
  const uniqueSports = useMemo(() => {
    return StudentAthleteService.getUniqueSports(allAthletes);
  }, [allAthletes]);

  // Get unique colleges for filter dropdown (normalized via school_id)
  const uniqueColleges = useMemo(() => {
    return StudentAthleteService.getUniqueCollegeNames(allAthletes, schoolIdToName);
  }, [allAthletes, schoolIdToName]);

  // Get unique genders for filter dropdown
  const uniqueGenders = useMemo(() => {
    return StudentAthleteService.getUniqueGenders(allAthletes);
  }, [allAthletes]);

  // Get unique years for filter dropdown
  const uniqueYears = useMemo(() => {
    return StudentAthleteService.getUniqueYears(allAthletes);
  }, [allAthletes]);

  // Get unique states for filter dropdown
  const uniqueStates = useMemo(() => {
    return StudentAthleteService.getUniqueStates(allAthletes);
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
    uniqueStates,
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
