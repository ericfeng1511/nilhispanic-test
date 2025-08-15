import { supabase } from '@/lib/supabaseClient';

export interface BrandRepresentative {
  id: string;
  profile_id: string;
  name: string | null;
  brand: string | null;
  title: string | null;
  department: string | null;
  bio: string | null;
  email: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  logo: string | null;
  created_at: string;
  updated_at: string;
}

export class BrandRepresentativeService {
  /**
   * Fetch brand representative by profile ID
   */
  static async fetchBrandRepresentativeByProfileId(profileId: string): Promise<BrandRepresentative | null> {
    try {
      console.log('🏢 Fetching brand representative for profile ID:', profileId);
      
      const { data, error } = await supabase
        .from('brand_representatives')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - brand representative doesn't exist yet
          console.log('ℹ️ No brand representative found for profile ID:', profileId);
          return null;
        }
        console.error('❌ Error fetching brand representative:', error);
        throw error;
      }

      console.log('✅ Brand representative fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Exception fetching brand representative:', error);
      throw error;
    }
  }

  /**
   * Update existing brand representative
   */
  static async updateBrandRepresentative(
    profileId: string, 
    updates: Partial<Pick<BrandRepresentative, 'name' | 'brand' | 'title' | 'department' | 'bio' | 'email' | 'linkedin_url' | 'website_url' | 'logo'>>
  ): Promise<BrandRepresentative> {
    try {
      console.log('🔄 Updating brand representative for profile ID:', profileId);
      console.log('📊 Update data:', updates);
      
      const { data, error } = await supabase
        .from('brand_representatives')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', profileId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating brand representative:', error);
        throw error;
      }

      console.log('✅ Brand representative updated successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Exception updating brand representative:', error);
      throw error;
    }
  }

  /**
   * Create new brand representative (should rarely be needed since auto-created on signup)
   */
  static async createBrandRepresentative(
    profileId: string,
    brandData: Partial<Pick<BrandRepresentative, 'name' | 'brand' | 'title' | 'department' | 'bio' | 'email' | 'linkedin_url' | 'website_url' | 'logo'>>
  ): Promise<BrandRepresentative> {
    try {
      console.log('➕ Creating brand representative for profile ID:', profileId);
      console.log('📊 Brand data:', brandData);
      
      const { data, error } = await supabase
        .from('brand_representatives')
        .insert({
          profile_id: profileId,
          ...brandData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating brand representative:', error);
        throw error;
      }

      console.log('✅ Brand representative created successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Exception creating brand representative:', error);
      throw error;
    }
  }
}
