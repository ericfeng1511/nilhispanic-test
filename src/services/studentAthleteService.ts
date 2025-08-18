import { supabase } from '@/lib/supabaseClient';
import { StudentAthlete, StudentAthleteFilters, PaginatedStudentAthletes } from '@/types/studentAthlete';

export class StudentAthleteService {
  /**
   * Fetch all student athletes (for caching purposes)
   * This will be used to cache the entire dataset in memory
   * Uses pagination to fetch ALL records beyond Supabase's hard limits
   */
  static async fetchAllStudentAthletes(): Promise<StudentAthlete[]> {
    try {
      let allAthletes: StudentAthlete[] = [];
      let page = 0;
      const pageSize = 1000; // Supabase's max per request
      let hasMore = true;

      console.log('Starting to fetch all student athletes...');

      while (hasMore) {
        const { data, error, count } = await supabase
          .from('student_athletes')
          .select('*', { count: 'exact' })
          .order('name', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error('Error fetching student athletes:', error);
          throw new Error(`Failed to fetch student athletes: ${error.message}`);
        }

        if (data && data.length > 0) {
          allAthletes = [...allAthletes, ...data];
          console.log(`Fetched page ${page + 1}: ${data.length} athletes (total so far: ${allAthletes.length})`);
          
          // Check if we have more data
          hasMore = data.length === pageSize;
          page++;
        } else {
          hasMore = false;
        }

        // Safety check to prevent infinite loops
        if (page > 50) {
          console.warn('Reached maximum page limit (50), stopping fetch');
          break;
        }
      }

      console.log(`✅ Successfully fetched ALL ${allAthletes.length} student athletes from database`);
      return allAthletes;
    } catch (error) {
      console.error('Unexpected error in fetchAllStudentAthletes:', error);
      throw error;
    }
  }

  /**
   * Get paginated and filtered results from cached data
   * This ensures no additional Supabase calls during pagination/filtering
   */
  static getPaginatedAthletes(
    allAthletes: StudentAthlete[],
    page: number = 1,
    pageSize: number = 100,
    filters: StudentAthleteFilters = {}
  ): PaginatedStudentAthletes {
    let filteredAthletes = [...allAthletes];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredAthletes = filteredAthletes.filter(athlete =>
        athlete.name.toLowerCase().includes(searchTerm)
      );
    }

    // Multi-select sports filter
    if (filters.sports && filters.sports.length > 0) {
      filteredAthletes = filteredAthletes.filter(athlete =>
        filters.sports!.some(sport => 
          athlete.sport.toLowerCase() === sport.toLowerCase()
        )
      );
    }

    // Multi-select colleges filter
    if (filters.colleges && filters.colleges.length > 0) {
      filteredAthletes = filteredAthletes.filter(athlete =>
        filters.colleges!.some(college => 
          athlete.college.toLowerCase().includes(college.toLowerCase())
        )
      );
    }

    // Multi-select genders filter
    if (filters.genders && filters.genders.length > 0) {
      filteredAthletes = filteredAthletes.filter(athlete =>
        filters.genders!.some(gender => 
          athlete.gender.toLowerCase() === gender.toLowerCase()
        )
      );
    }

    // Multi-select years filter
    if (filters.years && filters.years.length > 0) {
      filteredAthletes = filteredAthletes.filter(athlete =>
        filters.years!.some(year => 
          athlete.year.toLowerCase() === year.toLowerCase()
        )
      );
    }

    // Multi-select social media range filter
    if (filters.totalSmRanges && filters.totalSmRanges.length > 0) {
      filteredAthletes = filteredAthletes.filter(athlete =>
        filters.totalSmRanges!.some(range => 
          athlete.total_sm_range === range
        )
      );
    }

    // Calculate pagination
    const total = filteredAthletes.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredAthletes.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Get unique sports from all athletes (for filter dropdown)
   */
  static getUniqueSports(allAthletes: StudentAthlete[]): string[] {
    const sports = new Set(allAthletes.map(athlete => athlete.sport));
    return Array.from(sports).sort();
  }

  /**
   * Get unique colleges from all athletes (for filter dropdown)
   */
  static getUniqueColleges(allAthletes: StudentAthlete[]): string[] {
    const colleges = new Set(allAthletes.map(athlete => athlete.college));
    return Array.from(colleges).sort();
  }

  /**
   * Get unique genders from all athletes (for filter dropdown)
   */
  static getUniqueGenders(allAthletes: StudentAthlete[]): string[] {
    const genders = new Set(allAthletes.map(athlete => athlete.gender));
    return Array.from(genders).sort();
  }

  /**
   * Get unique academic years from all athletes (for filter dropdown)
   * Returns years in logical academic progression order
   */
  static getUniqueYears(allAthletes: StudentAthlete[]): string[] {
    // Normalize to uppercase strings and remove empty/null values
    const years = new Set(
      allAthletes
        .map(athlete => (athlete.year ? String(athlete.year).toUpperCase() : ''))
        .filter((y): y is string => !!y && y.trim() !== '')
    );
    const yearArray = Array.from(years);

    // Define the desired order for academic years
    const yearOrder = ['FR', 'SO', 'JR', 'SR', 'GR', 'RFR'];

    // Sort years based on the defined order, with unknown years at the end
    return yearArray.sort((a, b) => {
      const indexA = yearOrder.indexOf(a);
      const indexB = yearOrder.indexOf(b);

      // If both years are in the order array, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one is in the order array, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // If neither is in the order array, sort alphabetically
      return a.localeCompare(b);
    });
  }

  /**
   * Get unique social media ranges from all athletes (for filter dropdown)
   * Returns ranges in logical order from smallest to largest
   */
  static getUniqueTotalSmRanges(allAthletes: StudentAthlete[]): string[] {
    const ranges = new Set(allAthletes
      .map(athlete => athlete.total_sm_range)
      .filter(range => range && range.trim() !== '')
    );
    const rangeArray = Array.from(ranges);
    
    // Define the desired order for social media ranges
    const rangeOrder = ['0-999', '1000-1999', '2000-4999', '5000-9999', '10,000+'];
    
    // Sort ranges based on the defined order
    return rangeArray.sort((a, b) => {
      const indexA = rangeOrder.indexOf(a);
      const indexB = rangeOrder.indexOf(b);
      
      // If both ranges are in the order array, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one is in the order array, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither is in the order array, sort alphabetically
      return a.localeCompare(b);
    });
  }

  /**
   * Fetch a single student athlete by their profile_id
   */
  static async fetchStudentAthleteByProfileId(profileId: string): Promise<StudentAthlete | null> {
    try {
      console.log('Fetching student athlete for profile_id:', profileId);
      
      const { data, error } = await supabase
        .from('student_athletes')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No student athlete found for profile_id:', profileId);
          return null;
        }
        console.error('Error fetching student athlete:', error);
        throw new Error(`Failed to fetch student athlete: ${error.message}`);
      }

      console.log('✅ Student athlete fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error in fetchStudentAthleteByProfileId:', error);
      throw error;
    }
  }

  /**
   * Update a student athlete's profile information
   */
  static async updateStudentAthlete(
    profileId: string, 
    updates: Partial<Pick<StudentAthlete, 'sport' | 'year' | 'college' | 'hometown' | 'gender' | 'photo' | 'instagram_handle' | 'instagram_followers' | 'tiktok_handle' | 'tiktok_followers' | 'x_handle' | 'x_followers'>>
  ): Promise<StudentAthlete> {
    try {
      console.log('Updating student athlete for profile_id:', profileId, 'with updates:', updates);
      
      const { data, error } = await supabase
        .from('student_athletes')
        .update(updates)
        .eq('profile_id', profileId)
        .select()
        .single();

      if (error) {
        console.error('Error updating student athlete:', error);
        throw new Error(`Failed to update student athlete: ${error.message}`);
      }

      console.log('✅ Student athlete updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error in updateStudentAthlete:', error);
      throw error;
    }
  }

  /**
   * Create a new student athlete entry (for cases where profile exists but no athlete record)
   */
  static async createStudentAthlete(
    profileId: string,
    name: string,
    athleteData: Partial<Pick<StudentAthlete, 'sport' | 'year' | 'college' | 'hometown' | 'gender' | 'photo' | 'instagram_handle' | 'instagram_followers' | 'tiktok_handle' | 'tiktok_followers' | 'x_handle' | 'x_followers'>>
  ): Promise<StudentAthlete> {
    try {
      console.log('Creating student athlete for profile_id:', profileId, 'with data:', athleteData);
      
      const insertData = {
        profile_id: profileId,
        name: name,
        sport: athleteData.sport || 'Unknown',
        year: athleteData.year || 'FR',
        college: athleteData.college || 'Unknown',
        hometown: athleteData.hometown || 'Unknown',
        gender: athleteData.gender || 'Unknown',
        photo: athleteData.photo || '',
        instagram_handle: athleteData.instagram_handle || null,
        instagram_followers: athleteData.instagram_followers || null,
        tiktok_handle: athleteData.tiktok_handle || null,
        tiktok_followers: athleteData.tiktok_followers || null,
        x_handle: athleteData.x_handle || null,
        x_followers: athleteData.x_followers || null
      };
      
      const { data, error } = await supabase
        .from('student_athletes')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating student athlete:', error);
        throw new Error(`Failed to create student athlete: ${error.message}`);
      }

      console.log('✅ Student athlete created successfully:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error in createStudentAthlete:', error);
      throw error;
    }
  }
}
