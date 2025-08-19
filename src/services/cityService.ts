import { supabase } from '@/lib/supabaseClient';

export interface City {
  id: number;
  zip: string | null;
  city_name: string;
  state_id: string; // e.g., 'CA'
}

export class CityService {
  // Search by city name or zip; returns up to 10 results ordered nicely
  static async searchCities(query: string): Promise<City[]> {
    const q = query.trim();
    if (!q) return [];

    // Decide whether the query is predominantly ZIP or text
    const isZip = /\d{3,}/.test(q);

    // For performance, limit to 10 and order by city/state/zip
    if (isZip) {
      const { data, error } = await supabase
        .from('cities')
        .select('id, zip, city_name, state_id')
        .ilike('zip', `%${q}%`)
        .limit(10);
      if (error) throw error;
      return data || [];
    } else {
      // Try to parse patterns like "City, ST" or "City ST"
      let cityPart = q;
      let statePart: string | null = null;

      const commaMatch = q.match(/^\s*([^,]+?)[,\s]+([A-Za-z]{2})\s*$/);
      if (commaMatch) {
        cityPart = commaMatch[1].trim();
        statePart = commaMatch[2].trim().toUpperCase();
      } else {
        // Check if the last token is a 2-letter state
        const tokens = q.split(/\s+/);
        const last = tokens[tokens.length - 1];
        if (/^[A-Za-z]{2}$/.test(last)) {
          statePart = last.toUpperCase();
          cityPart = tokens.slice(0, -1).join(' ').trim();
        }
      }

      let builder = supabase
        .from('cities')
        .select('id, zip, city_name, state_id')
        .ilike('city_name', `%${cityPart}%`);

      if (statePart) {
        builder = builder.ilike('state_id', `${statePart}%`);
      }

      const { data, error } = await builder.limit(10);
      if (error) throw error;
      return data || [];
    }
  }

  static formatCityLabel(c: City): string {
    const zip = c.zip ? ` ${c.zip}` : '';
    return `${c.city_name}, ${c.state_id}${zip}`;
  }

  static async getCityById(id: number): Promise<City | null> {
    const { data, error } = await supabase
      .from('cities')
      .select('id, zip, city_name, state_id')
      .eq('id', id)
      .single();
    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }
    return data as City;
  }
}
