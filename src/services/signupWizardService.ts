import { supabase } from '@/lib/supabaseClient';

export interface SignupInitPayload {
  email: string;
  password: string;
  full_name: string;
  role: 'athlete' | 'brand' | 'admin';
}

export interface SignupUpdatePayload {
  profile_id: string;
  // Mirrors dashboard update fields (student_athletes columns)
  sport?: string;
  year?: 'FR' | 'SO' | 'JR' | 'SR' | 'RFR' | 'GR' | '';
  college?: string;
  hometown?: string;
  gender?: 'M' | 'F' | '';
  photo?: string; // URL (if client uploads directly; otherwise function handles upload)
  instagram_handle?: string;
  instagram_followers?: number;
  tiktok_handle?: string;
  tiktok_followers?: number;
  x_handle?: string;
  x_followers?: number;
  city_id?: number | null;
  school_id?: number | null;
}

export class SignupWizardService {
  // Creates auth user (no verification), creates initial student_athletes row
  static async init(payload: SignupInitPayload): Promise<{ profile_id: string }> {
    const { data, error } = await supabase.functions.invoke('provision_athlete', {
      body: { action: 'init', payload },
    });
    if (error) throw error;
    return data as { profile_id: string };
  }

  // Update student_athletes with same fields as dashboard
  static async update(payload: SignupUpdatePayload): Promise<{ success: true }> {
    const { data, error } = await supabase.functions.invoke('provision_athlete', {
      body: { action: 'update', payload },
    });
    if (error) throw error;
    return data as { success: true };
  }

  // Upload photo via Edge Function (preferred for consistent naming + public URL)
  static async uploadPhoto(profile_id: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('action', 'upload_photo');
    formData.append('profile_id', profile_id);
    formData.append('file', file);

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/provision_athlete`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || 'Photo upload failed');
    }
    const data = await res.json();
    return data as { url: string };
  }

  // Finalize: send verification email with redirect to athlete dashboard
  static async finalize(profile_id: string): Promise<{ success: true }> {
    const { data, error } = await supabase.functions.invoke('provision_athlete', {
      body: { action: 'finalize', payload: { profile_id } },
    });
    if (error) throw error;
    return data as { success: true };
  }
}
