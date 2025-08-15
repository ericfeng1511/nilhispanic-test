import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { CollegeService, College } from '@/services/collegeService';

interface CollegeFilters {
  search?: string;
  states?: string[];
  divisions?: string[];
  hasStudents?: boolean;
}

export const useColleges = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CollegeFilters>({});
  const pageSize = 100;

  // Fetch all colleges
  const {
    data: allColleges = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['colleges'],
    queryFn: CollegeService.fetchAllColleges,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch unique states
  const { data: uniqueStates = [] } = useQuery({
    queryKey: ['college-states'],
    queryFn: CollegeService.getUniqueStates,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch unique divisions
  const { data: uniqueDivisions = [] } = useQuery({
    queryKey: ['college-divisions'],
    queryFn: CollegeService.getUniqueDivisions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Apply filters and pagination to colleges
  const { colleges, totalColleges, totalPages } = useMemo(() => {
    let filteredColleges = [...allColleges];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredColleges = filteredColleges.filter(college =>
        college.name.toLowerCase().includes(searchLower) ||
        college.city?.toLowerCase().includes(searchLower) ||
        college.state?.toLowerCase().includes(searchLower)
      );
    }

    // Apply state filter
    if (filters.states && filters.states.length > 0) {
      filteredColleges = filteredColleges.filter(college =>
        college.state && filters.states!.includes(college.state)
      );
    }

    // Apply division filter
    if (filters.divisions && filters.divisions.length > 0) {
      filteredColleges = filteredColleges.filter(college =>
        college.division && filters.divisions!.includes(college.division)
      );
    }

    // Apply student filter
    if (filters.hasStudents !== undefined) {
      filteredColleges = filteredColleges.filter(college =>
        filters.hasStudents ? (college.student_count || 0) > 0 : (college.student_count || 0) === 0
      );
    }

    // Pagination
    const total = filteredColleges.length;
    const pages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredColleges.slice(startIndex, endIndex);

    return {
      colleges: paginatedData,
      totalColleges: total,
      totalPages: pages
    };
  }, [allColleges, filters, currentPage, pageSize]);

  // Navigation functions
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Filter functions
  const updateFilters = (newFilters: Partial<CollegeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Statistics
  const stats = useMemo(() => {
    const collegesWithStudents = allColleges.filter(c => (c.student_count || 0) > 0);
    const collegesWithCoordinates = allColleges.filter(c => c.latitude && c.longitude);
    const totalStudents = allColleges.reduce((sum, c) => sum + (c.student_count || 0), 0);

    return {
      totalColleges: allColleges.length,
      collegesWithStudents: collegesWithStudents.length,
      collegesWithCoordinates: collegesWithCoordinates.length,
      collegesWithoutCoordinates: allColleges.length - collegesWithCoordinates.length,
      totalStudents,
      averageStudentsPerCollege: allColleges.length > 0 ? Math.round(totalStudents / allColleges.length) : 0
    };
  }, [allColleges]);

  return {
    // Data
    colleges,
    allColleges,
    totalColleges,
    currentPage,
    totalPages,
    uniqueStates,
    uniqueDivisions,
    filters,
    stats,

    // State
    isLoading,
    isError,
    error,

    // Actions
    goToPage,
    updateFilters,
    clearFilters,
    refetch,
    hasNextPage,
    hasPreviousPage,
  };
};
