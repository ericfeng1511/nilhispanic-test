import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HighSchoolAthleteDashboard: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link to="/" className="inline-flex items-center text-nil-orange hover:underline">
            <ArrowLeft className="mr-2" size={18} /> Back to Home
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-nil-navy">
          Welcome, {profile?.full_name || 'Guest'}
        </h1>
        <p className="text-gray-600 mt-1">High School Athlete</p>

        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <p className="text-lg text-gray-500">Your dashboard is coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default HighSchoolAthleteDashboard;
