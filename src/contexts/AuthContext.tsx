import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'athlete' | 'brand';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: 'athlete' | 'brand' | 'admin') => Promise<{ error: any; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  resendVerification: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Profile fetch error:', error.code, error.message);
        if (error.code === 'PGRST116') {
          console.log('No profile found - this is normal for new users');
        }
        setProfile(null);
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
    }
  };

  const handleAuthStateChange = async (event: string, session: Session | null) => {
    console.log('Auth state change:', event, session?.user?.id);
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      await fetchProfile(session.user.id);
    } else {
      setProfile(null);
    }
    
    // Always set loading to false after handling auth state change
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (mounted) {
          await handleAuthStateChange('INITIAL_SESSION', session);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted && initialized) {
          await handleAuthStateChange(event, session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  // Refresh session when tab becomes visible to handle backgrounded tab issues
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && session) {
        try {
          console.log('Tab became visible, refreshing session...');
          const { data: { session: refreshedSession }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Session refresh error:', error);
            // If session is invalid, clear auth state
            if (error.message.includes('refresh_token_not_found') || error.message.includes('invalid_refresh_token')) {
              clearAuthState();
            }
          }
        } catch (error) {
          console.error('Unexpected session refresh error:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (mounted) {
          await handleAuthStateChange('INITIAL_SESSION', session);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted && initialized) {
          await handleAuthStateChange(event, session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signUp = async (email: string, password: string, fullName: string, role: 'athlete' | 'brand' | 'admin' = 'athlete') => {
    try {
      console.log('Attempting signup for:', email, 'with role:', role);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      console.log('Signup result:', { error, user: data.user?.id, session: !!data.session });

      // Check if user needs to verify email
      const needsVerification = data.user && !data.session;

      return { error, needsVerification };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting signin for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Signin result:', { error, user: data.user?.id, session: !!data.session });

      // Check if sign in failed due to unverified email
      let needsVerification = false;
      if (error && (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed'))) {
        needsVerification = true;
      }

      return { error, needsVerification };
    } catch (error) {
      console.error('Signin error:', error);
      return { error };
    }
  };

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      // 1. Clear client-side state immediately (optimistic)
      clearAuthState();
      
      // 2. Fire-and-forget server sign-out with timeout
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign-out timed out')), 3000)
      );
      
      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('Server sign-out completed');
    } catch (error) {
      console.error('Signout error (non-fatal):', error);
      // Even if server sign-out fails, user is logged out locally
      // Token will expire naturally
    } finally {
      // 3. Hard refresh to eliminate any state management issues
      console.log('Refreshing page after logout...');
      window.location.reload();
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error && profile) {
        setProfile({ ...profile, ...updates });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
