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

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

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
      console.error('Profile fetch failed:', error);
      console.log('Continuing without profile - user can still use the app');
      setProfile(null);
    }
  };

  const createStudentAthleteIfNeeded = async (userId: string, userMetadata: any) => {
    // Check if user is an athlete and if student athlete entry already exists
    const role = userMetadata?.role;
    
    if (role !== 'athlete') {
      console.log('🚫 User is not an athlete, skipping student athlete creation');
      return;
    }

    try {
      console.log('🔍 Checking if student athlete entry already exists...');
      
      // Check if student athlete entry already exists
      const { data: existingAthlete, error: checkError } = await supabase
        .from('student_athletes')
        .select('id')
        .eq('profile_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing student athlete:', checkError);
        return;
      }

      if (existingAthlete) {
        console.log('✅ Student athlete entry already exists, skipping creation');
        return;
      }

      console.log('🏃‍♂️ Creating student athlete entry for verified user...');
      console.log('📝 User details:', {
        userId: userId,
        fullName: userMetadata?.full_name,
        role: role
      });
      
      const insertData = {
        profile_id: userId,
        name: userMetadata?.full_name || 'Unknown'
      };
      
      console.log('📊 Insert data:', insertData);
      
      const { data: insertResult, error: athleteError } = await supabase
        .from('student_athletes')
        .insert(insertData)
        .select();

      if (athleteError) {
        console.error('❌ Error creating student athlete entry (post-verification):');
        console.error('Error details:', athleteError);
        console.error('Error code:', athleteError.code);
        console.error('Error message:', athleteError.message);
      } else {
        console.log('✅ Student athlete entry created successfully (post-verification)!');
        console.log('📋 Inserted record:', insertResult);
      }
    } catch (error) {
      console.error('💥 Exception in createStudentAthleteIfNeeded:', error);
    }
  };

  const handleAuthStateChange = async (event: string, session: Session | null) => {
    console.log('Auth state change:', event, session?.user?.id);
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      // Fetch profile but don't let it block the auth flow
      fetchProfile(session.user.id).catch(error => {
        console.error('Profile fetch failed, continuing anyway:', error);
      });
      
      // Try to create student athlete entry if needed (for post-verification)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('🔄 Attempting post-verification student athlete creation...');
        createStudentAthleteIfNeeded(session.user.id, session.user.user_metadata).catch(error => {
          console.error('Failed to create student athlete entry post-verification:', error);
        });
      }
    } else {
      setProfile(null);
    }
    
    // Always set loading to false immediately, don't wait for profile
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (mounted) {
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          await handleAuthStateChange(event, session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

      // If signup was successful and user is an athlete, create student athlete entry
      if (!error && data.user && role === 'athlete') {
        console.log('🏃‍♂️ User is an athlete - proceeding to create student athlete entry');
        console.log('📝 User details:', {
          userId: data.user.id,
          email: data.user.email,
          fullName: fullName,
          role: role
        });
        
        try {
          console.log('🔄 Attempting to insert into student_athletes table...');
          
          const insertData = {
            profile_id: data.user.id,
            name: fullName
          };
          
          console.log('📊 Insert data:', insertData);
          
          const { data: insertResult, error: athleteError } = await supabase
            .from('student_athletes')
            .insert(insertData)
            .select(); // Add select to see what was inserted

          if (athleteError) {
            console.error('❌ Error creating student athlete entry:');
            console.error('Error details:', athleteError);
            console.error('Error code:', athleteError.code);
            console.error('Error message:', athleteError.message);
            console.error('Error hint:', athleteError.hint);
            // Don't fail the signup if student athlete creation fails
            // The user account was created successfully
          } else {
            console.log('✅ Student athlete entry created successfully!');
            console.log('📋 Inserted record:', insertResult);
          }
        } catch (athleteCreationError) {
          console.error('💥 Exception creating student athlete entry:');
          console.error('Exception details:', athleteCreationError);
          console.error('Exception stack:', athleteCreationError.stack);
          // Don't fail the signup if student athlete creation fails
        }
      }
      
      // If signup was successful and user is a brand representative, create brand representative entry
      if (!error && data.user && role === 'brand') {
        console.log('🏢 User is a brand representative - proceeding to create brand representative entry');
        console.log('📝 User details:', {
          userId: data.user.id,
          email: data.user.email,
          fullName: fullName,
          role: role
        });
        
        try {
          console.log('🔄 Attempting to insert into brand_representatives table...');
          
          const insertData = {
            profile_id: data.user.id,
            name: fullName,
            email: email
          };
          
          console.log('📊 Insert data:', insertData);
          
          const { data: insertResult, error: brandError } = await supabase
            .from('brand_representatives')
            .insert(insertData)
            .select(); // Add select to see what was inserted

          if (brandError) {
            console.error('❌ Error creating brand representative entry:');
            console.error('Error details:', brandError);
            console.error('Error code:', brandError.code);
            console.error('Error message:', brandError.message);
            console.error('Error hint:', brandError.hint);
            // Don't fail the signup if brand representative creation fails
            // The user account was created successfully
          } else {
            console.log('✅ Brand representative entry created successfully!');
            console.log('📋 Inserted record:', insertResult);
          }
        } catch (brandCreationError) {
          console.error('💥 Exception creating brand representative entry:');
          console.error('Exception details:', brandCreationError);
          console.error('Exception stack:', brandCreationError.stack);
          // Don't fail the signup if brand representative creation fails
        }
      }
      
      if (!error && data.user && role !== 'athlete' && role !== 'brand') {
        console.log('ℹ️ Skipping automatic table entry creation:');
        console.log('- Signup error:', !!error);
        console.log('- User created:', !!data.user);
        console.log('- Role:', role, '(not athlete or brand)');
      }

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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // Supabase will trigger onAuthStateChange which will clear our state
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
