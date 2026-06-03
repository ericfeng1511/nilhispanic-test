import { supabase } from '@/lib/supabaseClient';

export interface HighSchoolAthleteUser {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  sport: string | null;
  grade: number | null;
  age: number | null;
  hometown: string | null;
  instagram_handle: string | null;
  cultural_roots: string[] | null;
  photo: string | null;
}

export class HighSchoolAthleteService {
  static async fetchAll(): Promise<HighSchoolAthleteUser[]> {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('role', 'high_school_athlete')
      .order('created_at', { ascending: false });

    if (profilesError) throw new Error(profilesError.message);
    if (!profiles || profiles.length === 0) return [];

    const profileIds = profiles.map((p) => p.id);
    const { data: details } = await supabase
      .from('high_school_athletes')
      .select('profile_id, sport, grade, age, hometown, instagram_handle, cultural_roots, photo')
      .in('profile_id', profileIds);

    const detailMap: Record<string, any> = {};
    for (const d of details || []) {
      detailMap[d.profile_id] = d;
    }

    return profiles.map((p) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      created_at: p.created_at,
      sport: detailMap[p.id]?.sport ?? null,
      grade: detailMap[p.id]?.grade ?? null,
      age: detailMap[p.id]?.age ?? null,
      hometown: detailMap[p.id]?.hometown ?? null,
      instagram_handle: detailMap[p.id]?.instagram_handle ?? null,
      cultural_roots: detailMap[p.id]?.cultural_roots ?? null,
      photo: detailMap[p.id]?.photo ?? null,
    }));
  }

  static async fetchByProfileId(profileId: string): Promise<{ name: string | null; photo: string | null } | null> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', profileId)
      .single();
    if (!profile) return null;
    const { data: detail } = await supabase
      .from('high_school_athletes')
      .select('photo')
      .eq('profile_id', profileId)
      .maybeSingle();
    return { name: profile.full_name, photo: detail?.photo ?? null };
  }
}
