import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ROLE_DASHBOARDS: Record<string, string> = {
  athlete: '/athlete/dashboard',
  high_school_athlete: '/highschool/dashboard',
  family_friend: '/family/dashboard',
  brand: '/brand/dashboard',
  admin: '/admin/dashboard',
};

const AuthVerify: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const role = profile?.role ?? user?.user_metadata?.role;
    const destination = ROLE_DASHBOARDS[role] ?? '/athlete/dashboard';
    navigate(destination, { replace: true });
  }, [loading, user, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-nil-orange" />
    </div>
  );
};

export default AuthVerify;
