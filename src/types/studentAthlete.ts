export interface StudentAthlete {
  id: string;
  profile_id?: string; // UUID linking to profiles.id
  name: string;
  sport: string;
  year: string; // FR, SO, JR, SR
  college: string;
  hometown: string;
  state?: string; // Two-letter state abbreviation (e.g., CA, TX)
  city_id?: number; // FK to cities.id (nullable during migration)
  school_id?: number; // FK to schools.id (nullable during migration)
  gender: string; // M or F
  photo: string;
  instagram_handle?: string;
  instagram_followers?: number;
  tiktok_handle?: string;
  tiktok_followers?: number;
  x_handle?: string;
  x_followers?: number;
  cultural_roots?: string[]; // Array of cultural roots (text[])
  total_followers?: number; // Sum of all social media followers
  total_sm_range?: string; // 0-999, 1000-1999, 2000-4000, 5000-9999, 10,000+
  created_at?: string;
  updated_at?: string;
}

export interface StudentAthleteFilters {
  sports?: string[]; // Changed from sport to sports array
  colleges?: string[]; // Changed from college to colleges array
  genders?: string[]; // Multi-select gender filter
  years?: string[]; // Multi-select academic year filter
  totalSmRanges?: string[]; // Multi-select social media range filter
  states?: string[]; // Multi-select state filter using two-letter abbreviations
  search?: string;
  /**
   * Filter by whether the athlete has a linked profile (`profile_id`) or not.
   * 'profiles' = only athletes WITH a profile_id
   * 'database' = only athletes WITHOUT a profile_id
   */
  profileFilter?: 'profiles' | 'database';
  sortBy?: 'firstName' | 'lastName' | 'profileCreatedAt';
  sortDir?: 'asc' | 'desc';
  // Filter: profile created date range (YYYY-MM-DD). Placeholders default to 2025-07-01 in service.
  profileCreatedStart?: string;
  profileCreatedEnd?: string;
}

export interface PaginatedStudentAthletes {
  data: StudentAthlete[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
