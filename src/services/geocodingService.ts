import { supabase } from '@/lib/supabaseClient';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

export class GeocodingService {
  private static readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
  private static readonly DELAY_MS = 1000; // 1 second delay between requests to respect rate limits

  /**
   * Geocode a college name using OpenStreetMap Nominatim with multiple fallback strategies
   */
  static async geocodeCollege(collegeName: string): Promise<GeocodeResult | null> {
    try {
      console.log(`🌍 Geocoding: ${collegeName}`);
      
      // Multiple search strategies in order of preference
      const searchStrategies = [
        // Strategy 1: Exact name as-is (works for properly formatted names)
        collegeName,
        
        // Strategy 2: Add "USA" for international disambiguation
        `${collegeName} USA`,
        
        // Strategy 3: Clean up common abbreviations and add context
        this.cleanCollegeName(collegeName),
        
        // Strategy 4: Add generic university terms if not present
        this.addUniversityTerms(collegeName),
        
        // Strategy 5: Simplified name (remove campus info, etc.)
        this.simplifyCollegeName(collegeName)
      ];
      
      // Try each strategy until we get a result
      for (let i = 0; i < searchStrategies.length; i++) {
        const searchQuery = searchStrategies[i];
        console.log(`🔍 Strategy ${i + 1}: "${searchQuery}"`);
        
        const result = await this.performGeocodingQuery(searchQuery);
        if (result) {
          console.log(`✅ Geocoded ${collegeName} using strategy ${i + 1}:`, result);
          return result;
        }
        
        // Small delay between attempts to be respectful to the API
        if (i < searchStrategies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log(`❌ Failed to geocode: ${collegeName} (tried ${searchStrategies.length} strategies)`);
      return null;
    } catch (error) {
      console.error(`💥 Error geocoding ${collegeName}:`, error);
      return null;
    }
  }
  
  /**
   * Perform the actual geocoding API query
   */
  private static async performGeocodingQuery(searchQuery: string): Promise<GeocodeResult | null> {
    try {
      const response = await fetch(
        `${this.NOMINATIM_BASE_URL}?` + 
        new URLSearchParams({
          q: searchQuery,
          format: 'json',
          limit: '3', // Get top 3 results to find best match
          countrycodes: 'us',
          addressdetails: '1',
          'accept-language': 'en'
        })
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        return null;
      }

      // Find the best result (prefer universities/colleges)
      const bestResult = this.selectBestResult(data, searchQuery);
      
      if (!bestResult) {
        return null;
      }

      return {
        latitude: parseFloat(bestResult.lat),
        longitude: parseFloat(bestResult.lon),
        city: bestResult.address?.city || bestResult.address?.town || bestResult.address?.village,
        state: bestResult.address?.state,
        country: bestResult.address?.country
      };
    } catch (error) {
      console.error(`💥 Error in geocoding query:`, error);
      return null;
    }
  }
  
  /**
   * Clean up college name by expanding abbreviations and fixing common issues
   */
  private static cleanCollegeName(name: string): string {
    let cleaned = name;
    
    // Common abbreviations to expand
    const abbreviations: Record<string, string> = {
      'Univ\.': 'University',
      'Coll\.': 'College',
      'St\.': 'State',
      'Tech\.': 'Technical',
      'Inst\.': 'Institute',
      '&': 'and',
      'Cal State': 'California State University',
      'UC ': 'University of California ',
      'SUNY': 'State University of New York'
    };
    
    Object.entries(abbreviations).forEach(([abbrev, full]) => {
      const regex = new RegExp(abbrev, 'gi');
      cleaned = cleaned.replace(regex, full);
    });
    
    return `${cleaned} USA`;
  }
  
  /**
   * Add university/college terms if not already present
   */
  private static addUniversityTerms(name: string): string {
    const lowerName = name.toLowerCase();
    
    // If it already contains university/college terms, just add USA
    if (lowerName.includes('university') || lowerName.includes('college') || 
        lowerName.includes('institute') || lowerName.includes('school')) {
      return `${name} USA`;
    }
    
    // Otherwise, try adding university first, then college
    return `${name} University USA`;
  }
  
  /**
   * Simplify college name by removing campus info and extra details
   */
  private static simplifyCollegeName(name: string): string {
    let simplified = name;
    
    // Remove campus-specific information
    simplified = simplified.replace(/, [^,]*Campus$/i, '');
    simplified = simplified.replace(/ - [^-]*Campus$/i, '');
    simplified = simplified.replace(/ \([^)]*Campus[^)]*\)$/i, '');
    
    // Remove other parenthetical information
    simplified = simplified.replace(/ \([^)]*\)$/i, '');
    
    // Remove trailing location info
    simplified = simplified.replace(/, [A-Z]{2}$/i, ''); // Remove state codes
    
    return `${simplified} USA`;
  }
  
  /**
   * Select the best result from multiple geocoding results
   */
  private static selectBestResult(results: any[], originalQuery: string): any | null {
    if (!results || results.length === 0) return null;
    
    // Prefer results that are specifically educational institutions
    const educationalTypes = ['university', 'college', 'school', 'institute'];
    
    for (const result of results) {
      const displayName = (result.display_name || '').toLowerCase();
      const type = (result.type || '').toLowerCase();
      const category = (result.category || '').toLowerCase();
      
      // Check if this looks like an educational institution
      if (educationalTypes.some(term => 
        displayName.includes(term) || type.includes(term) || category.includes(term)
      )) {
        return result;
      }
    }
    
    // If no educational institution found, return the first result
    return results[0];
  }

  /**
   * Geocode all colleges that don't have coordinates
   */
  static async geocodeAllColleges(): Promise<void> {
    try {
      console.log('🏫 Starting batch geocoding of colleges...');
      
      // Get colleges without coordinates
      const { data: colleges, error } = await supabase
        .from('schools')
        .select('id, name')
        .or('latitude.is.null,longitude.is.null')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch colleges: ${error.message}`);
      }

      if (!colleges || colleges.length === 0) {
        console.log('✅ All colleges already have coordinates!');
        return;
      }

      console.log(`📍 Found ${colleges.length} colleges to geocode`);
      
      let successCount = 0;
      let failCount = 0;

      for (const college of colleges) {
        try {
          // Respect rate limits
          await this.delay(this.DELAY_MS);
          
          const geocodeResult = await this.geocodeCollege(college.name);
          
          if (geocodeResult) {
            // Update the college with coordinates
            const { error: updateError } = await supabase
              .from('schools')
              .update({
                latitude: geocodeResult.latitude,
                longitude: geocodeResult.longitude,
                city: geocodeResult.city,
                state: geocodeResult.state,
                updated_at: new Date().toISOString()
              })
              .eq('id', college.id);

            if (updateError) {
              console.error(`❌ Failed to update ${college.name}:`, updateError);
              failCount++;
            } else {
              console.log(`✅ Updated coordinates for ${college.name}`);
              successCount++;
            }
          } else {
            console.log(`⚠️ Could not geocode ${college.name}`);
            failCount++;
          }
        } catch (error) {
          console.error(`💥 Error processing ${college.name}:`, error);
          failCount++;
        }
      }

      console.log(`🎉 Geocoding complete! Success: ${successCount}, Failed: ${failCount}`);
    } catch (error) {
      console.error('💥 Error in batch geocoding:', error);
      throw error;
    }
  }

  /**
   * Geocode a specific college by ID
   */
  static async geocodeCollegeById(collegeId: number): Promise<boolean> {
    try {
      // Get the college name
      const { data: college, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('id', collegeId)
        .single();

      if (error || !college) {
        throw new Error(`College not found: ${collegeId}`);
      }

      const geocodeResult = await this.geocodeCollege(college.name);
      
      if (!geocodeResult) {
        return false;
      }

      // Update the college with coordinates
      const { error: updateError } = await supabase
        .from('schools')
        .update({
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
          city: geocodeResult.city,
          state: geocodeResult.state,
          updated_at: new Date().toISOString()
        })
        .eq('id', collegeId);

      if (updateError) {
        throw new Error(`Failed to update college: ${updateError.message}`);
      }

      return true;
    } catch (error) {
      console.error(`💥 Error geocoding college ${collegeId}:`, error);
      return false;
    }
  }

  /**
   * Helper method to add delay between API calls
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get colleges that don't have coordinates (only those with student athletes)
   */
  static async getCollegesWithoutCoordinates(): Promise<Array<{id: number, name: string}>> {
    try {
      // First get school IDs that have student athletes
      const { data: schoolsWithStudents, error: studentsError } = await supabase
        .from('student_athletes')
        .select('school_id')
        .not('school_id', 'is', null);

      if (studentsError) {
        throw new Error(`Failed to fetch student athletes: ${studentsError.message}`);
      }

      // Get unique school IDs that have students
      const schoolIdsWithStudents = [...new Set(schoolsWithStudents?.map(s => s.school_id) || [])];
      
      if (schoolIdsWithStudents.length === 0) {
        return [];
      }

      // Now get only those schools that have students AND don't have coordinates
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .in('id', schoolIdsWithStudents)
        .or('latitude.is.null,longitude.is.null')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch colleges without coordinates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('💥 Error getting colleges without coordinates:', error);
      return [];
    }
  }

  /**
   * Get geocoding progress statistics
   */
  static async getGeocodingStats(): Promise<{
    total: number;
    geocoded: number;
    remaining: number;
    percentage: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, latitude, longitude');

      if (error) {
        throw new Error(`Failed to fetch schools: ${error.message}`);
      }

      const total = data?.length || 0;
      const geocoded = data?.filter(school => school.latitude && school.longitude).length || 0;
      const remaining = total - geocoded;
      const percentage = total > 0 ? Math.round((geocoded / total) * 100) : 0;

      return {
        total,
        geocoded,
        remaining,
        percentage
      };
    } catch (error) {
      console.error('💥 Error getting geocoding stats:', error);
      return { total: 0, geocoded: 0, remaining: 0, percentage: 0 };
    }
  }
}
