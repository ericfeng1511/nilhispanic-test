import { supabase } from '@/lib/supabaseClient';

export interface College {
  id: number;
  name: string;
  url?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  student_count?: number;
  division?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedColleges {
  data: College[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class CollegeService {
  /**
   * Fetch all colleges with student athlete counts
   */
  static async fetchAllColleges(): Promise<College[]> {
    try {
      console.log('🏫 Fetching all colleges...');
      
      // First get schools that have student athletes
      const { data: schoolsWithStudents, error: studentsError } = await supabase
        .from('student_athletes')
        .select('school_id')
        .not('school_id', 'is', null);

      if (studentsError) {
        console.error('❌ Error fetching student athletes:', studentsError);
        throw new Error(`Failed to fetch student athletes: ${studentsError.message}`);
      }

      // Get unique school IDs that have students
      const schoolIdsWithStudents = [...new Set(schoolsWithStudents?.map(s => s.school_id) || [])];
      
      if (schoolIdsWithStudents.length === 0) {
        console.log('⚠️ No schools found with student athletes');
        return [];
      }

      // Now fetch only schools that have student athletes (with all available columns)
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          url,
          city,
          state,
          latitude,
          longitude,
          division,
          created_at,
          updated_at
        `)
        .in('id', schoolIdsWithStudents)
        .order('name');

      if (error) {
        console.error('❌ Error fetching colleges:', error);
        throw new Error(`Failed to fetch colleges: ${error.message}`);
      }



      // Get student counts for each college
      const { data: studentCounts, error: countError } = await supabase
        .from('student_athletes')
        .select('school_id')
        .not('school_id', 'is', null);

      if (countError) {
        console.warn('⚠️ Could not fetch student counts:', countError);
      }

      // Count students per school
      const studentCountMap = new Map<number, number>();
      if (studentCounts) {
        studentCounts.forEach(record => {
          if (record.school_id) {
            studentCountMap.set(
              record.school_id, 
              (studentCountMap.get(record.school_id) || 0) + 1
            );
          }
        });
      }

      // Combine college data with student counts
      const collegesWithCounts: College[] = (data || []).map(college => ({
        ...college,
        student_count: studentCountMap.get(college.id) || 0
      }));

      console.log(`✅ Successfully fetched ${collegesWithCounts.length} colleges`);
      return collegesWithCounts;
    } catch (error) {
      console.error('💥 Unexpected error in fetchAllColleges:', error);
      throw error;
    }
  }

  /**
   * Get paginated colleges with filtering
   */
  static async getPaginatedColleges(
    page: number = 1,
    pageSize: number = 100,
    filters: {
      search?: string;
      states?: string[];
      divisions?: string[];
      hasStudents?: boolean;
    } = {}
  ): Promise<PaginatedColleges> {
    try {
      const allColleges = await this.fetchAllColleges();
      
      // Apply filters
      let filteredColleges = allColleges;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredColleges = filteredColleges.filter(college =>
          college.name.toLowerCase().includes(searchLower) ||
          college.city?.toLowerCase().includes(searchLower) ||
          college.state?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.states && filters.states.length > 0) {
        filteredColleges = filteredColleges.filter(college =>
          college.state && filters.states!.includes(college.state)
        );
      }

      if (filters.divisions && filters.divisions.length > 0) {
        filteredColleges = filteredColleges.filter(college =>
          college.division && filters.divisions!.includes(college.division)
        );
      }

      if (filters.hasStudents !== undefined) {
        filteredColleges = filteredColleges.filter(college =>
          filters.hasStudents ? (college.student_count || 0) > 0 : (college.student_count || 0) === 0
        );
      }

      // Pagination
      const total = filteredColleges.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredColleges.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('💥 Error in getPaginatedColleges:', error);
      throw error;
    }
  }

  /**
   * Get unique states from colleges
   */
  static async getUniqueStates(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('state')
        .not('state', 'is', null);

      if (error) {
        console.error('❌ Error fetching states:', error);
        return [];
      }

      const uniqueStates = [...new Set(data.map(item => item.state).filter(Boolean))].sort() as string[];
      return uniqueStates;
    } catch (error) {
      console.error('💥 Error in getUniqueStates:', error);
      return [];
    }
  }

  /**
   * Get unique divisions from colleges
   */
  static async getUniqueDivisions(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('division')
        .not('division', 'is', null);

      if (error) {
        console.error('❌ Error fetching divisions:', error);
        return [];
      }

      const uniqueDivisions = [...new Set(data.map(item => item.division).filter(Boolean))].sort() as string[];
      return uniqueDivisions;
    } catch (error) {
      console.error('💥 Error in getUniqueDivisions:', error);
      return [];
    }
  }

  /**
   * Update college coordinates
   */
  static async updateCollegeCoordinates(
    collegeId: number, 
    latitude: number, 
    longitude: number
  ): Promise<College> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update({ 
          latitude, 
          longitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', collegeId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating college coordinates:', error);
        throw new Error(`Failed to update college coordinates: ${error.message}`);
      }

      console.log('✅ College coordinates updated successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Unexpected error in updateCollegeCoordinates:', error);
      throw error;
    }
  }

  /**
   * Get colleges with missing coordinates
   */
  static async getCollegesWithoutCoordinates(): Promise<College[]> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .or('latitude.is.null,longitude.is.null')
        .order('name');

      if (error) {
        console.error('❌ Error fetching colleges without coordinates:', error);
        throw new Error(`Failed to fetch colleges without coordinates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('💥 Unexpected error in getCollegesWithoutCoordinates:', error);
      throw error;
    }
  }

  /**
   * Lightweight search against schools table by name (for autocomplete)
   */
  static async searchSchoolsByName(query: string): Promise<Pick<College, 'id' | 'name'>[]> {
    const q = (query || '').trim();
    if (!q) return [];
    const { data, error } = await supabase
      .from('schools')
      .select('id, name')
      .ilike('name', `%${q}%`)
      .order('name')
      .limit(10);
    if (error) throw error;
    return (data || []) as Pick<College, 'id' | 'name'>[];
  }

  /**
   * Get a single school by id (id, name only)
   */
  static async getSchoolById(id: number): Promise<Pick<College, 'id' | 'name'> | null> {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name')
      .eq('id', id)
      .single();
    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }
    return data as Pick<College, 'id' | 'name'>;
  }

  /**
   * Get multiple schools by ids (id, name only)
   * Returns an array of minimal school objects for the provided ids.
   */
  static async getSchoolsByIds(ids: number[]): Promise<Pick<College, 'id' | 'name'>[]> {
    const uniqueIds = Array.from(new Set((ids || []).filter((v): v is number => typeof v === 'number')));
    if (uniqueIds.length === 0) return [];

    const { data, error } = await supabase
      .from('schools')
      .select('id, name')
      .in('id', uniqueIds)
      .order('name');

    if (error) {
      // Surface error for caller to handle; return empty list as safe fallback
      console.error('Error fetching schools by ids:', error);
      throw error;
    }

    return (data || []) as Pick<College, 'id' | 'name'>[];
  }
}
