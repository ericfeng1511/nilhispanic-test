import React, { useEffect, useState } from 'react';
import { AlumniUser } from '@/services/alumniService';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, MapPin } from 'lucide-react';

interface AlumniCardProps {
  user: AlumniUser;
  onClick?: () => void;
}

export const AlumniCard: React.FC<AlumniCardProps> = ({ user, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const hasPhoto = !!(user.photo && user.photo.trim() !== '');

  useEffect(() => {
    if (hasPhoto) {
      setImageError(false);
      setImageLoading(true);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [user.id, user.photo, hasPhoto]);

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Desktop layout */}
        <div className="hidden sm:block">
          <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-gray-100">
            {imageLoading && hasPhoto && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nil-orange" />
              </div>
            )}
            {!imageError && hasPhoto ? (
              <img
                src={user.photo!}
                alt={user.full_name || 'Alumni'}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={() => { setImageError(true); setImageLoading(false); }}
                onLoad={() => setImageLoading(false)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nil-orange to-nil-navy">
                <User className="w-16 h-16 text-white opacity-60" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-nil-orange line-clamp-2 group-hover:text-nil-navy transition-colors">
              {user.full_name || <span className="italic text-gray-400">No name</span>}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{user.email}</span>
            </div>
            {user.hometown && (
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="line-clamp-1">{user.hometown}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex sm:hidden items-center space-x-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {imageLoading && hasPhoto && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-nil-orange" />
              </div>
            )}
            {!imageError && hasPhoto ? (
              <img
                src={user.photo!}
                alt={user.full_name || 'Alumni'}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={() => { setImageError(true); setImageLoading(false); }}
                onLoad={() => setImageLoading(false)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nil-orange to-nil-navy">
                <User className="w-8 h-8 text-white opacity-60" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-nil-orange line-clamp-1 group-hover:text-nil-navy transition-colors">
              {user.full_name || <span className="italic text-gray-400">No name</span>}
            </h3>
            <div className="flex items-center text-gray-600 text-xs mt-1">
              <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{user.email}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
