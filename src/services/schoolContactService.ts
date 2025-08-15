import { supabase } from '@/lib/supabaseClient';
import { SchoolContact, SchoolContactFilters, PaginatedSchoolContacts } from '@/types/schoolContact';

export class SchoolContactService {
  /**
   * Fetch all school contacts (for caching purposes)
   * This will be used to cache the entire dataset in memory
   * Uses pagination to fetch ALL records beyond Supabase's hard limits
   */
  static async fetchAllSchoolContacts(): Promise<SchoolContact[]> {
    try {
      let allContacts: SchoolContact[] = [];
      let page = 0;
      const pageSize = 1000; // Supabase's max per request
      let hasMore = true;

      console.log('Starting to fetch all school contacts...');

      while (hasMore) {
        const { data, error, count } = await supabase
          .from('school_contacts')
          .select('*', { count: 'exact' })
          .order('name', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error('Error fetching school contacts:', error);
          throw new Error(`Failed to fetch school contacts: ${error.message}`);
        }

        if (data && data.length > 0) {
          allContacts = [...allContacts, ...data];
          console.log(`Fetched page ${page + 1}: ${data.length} contacts (total so far: ${allContacts.length})`);
          
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

      console.log(`✅ Successfully fetched ALL ${allContacts.length} school contacts from database`);
      return allContacts;
    } catch (error) {
      console.error('Unexpected error in fetchAllSchoolContacts:', error);
      throw error;
    }
  }

  /**
   * Get paginated and filtered results from cached data
   * This ensures no additional Supabase calls during pagination/filtering
   */
  static getPaginatedContacts(
    allContacts: SchoolContact[],
    page: number = 1,
    pageSize: number = 100,
    filters: SchoolContactFilters = {}
  ): PaginatedSchoolContacts {
    let filteredContacts = [...allContacts];

    // Apply filters
    if (filters.searchTerm) {
      const searchTermValue = filters.searchTerm.toLowerCase();
      filteredContacts = filteredContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTermValue)
      );
    }

    if (filters.college) {
      filteredContacts = filteredContacts.filter(contact =>
        contact.college === filters.college
      );
    }

    // Calculate pagination
    const total = filteredContacts.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredContacts.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Get unique colleges from all contacts (for filter dropdown)
   */
  static getUniqueColleges(allContacts: SchoolContact[]): string[] {
    const colleges = new Set(allContacts.map(contact => contact.college));
    return Array.from(colleges).sort();
  }

  /**
   * Get unique titles from all contacts (for filter dropdown)
   */
  static getUniqueTitles(allContacts: SchoolContact[]): string[] {
    const titles = new Set(allContacts.map(contact => contact.title));
    return Array.from(titles).sort();
  }
}
