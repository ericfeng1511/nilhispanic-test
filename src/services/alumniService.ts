import { supabase } from '@/lib/supabaseClient';

export interface AlumniUser {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  age: number | null;
  hometown: string | null;
  instagram_handle: string | null;
  cultural_roots: string[] | null;
  photo: string | null;
}

export class AlumniService {
  static async fetchAll(): Promise<AlumniUser[]> {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('role', 'alumni')
      .order('created_at', { ascending: false });

    if (profilesError) throw new Error(profilesError.message);
    if (!profiles || profiles.length === 0) return [];

    const profileIds = profiles.map((p) => p.id);
    const { data: details } = await supabase
      .from('alumni')
      .select('profile_id, age, hometown, instagram_handle, cultural_roots, photo')
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
      .from('alumni')
      .select('photo')
      .eq('profile_id', profileId)
      .maybeSingle();
    return { name: profile.full_name, photo: detail?.photo ?? null };
  }
}
