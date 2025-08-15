import React, { useState, useEffect } from 'react';
import { StudentAthlete } from '@/types/studentAthlete';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Trophy, Calendar, Users, Instagram, Music, Twitter } from 'lucide-react';
import { formatAcademicYear, formatGender } from '@/utils/formatters';

interface AthleteDetailModalProps {
  athlete: StudentAthlete | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AthleteDetailModal: React.FC<AthleteDetailModalProps> = ({
  athlete,
  isOpen,
  onClose,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Reset image state when athlete changes
  useEffect(() => {
    if (athlete) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [athlete]);

  if (!athlete) return null;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const formatInstagramHandle = (handle?: string) => {
    if (!handle || handle.toLowerCase() === 'n/a' || handle.trim() === '') {
      return 'N/A';
    }
    return handle.startsWith('@') ? handle : `@${handle}`;
  };

  const formatInstagramFollowers = (followers?: number) => {
    if (!followers || followers === 0) return 'N/A';
    return followers.toLocaleString();
  };

  const formatTikTokHandle = (handle?: string) => {
    if (!handle || handle.toLowerCase() === 'n/a' || handle.trim() === '') {
      return 'N/A';
    }
    return handle.startsWith('@') ? handle : `@${handle}`;
  };

  const formatTikTokFollowers = (followers?: number) => {
    if (!followers || followers === 0) return 'N/A';
    return followers.toLocaleString();
  };

  const formatXHandle = (handle?: string) => {
    if (!handle || handle.toLowerCase() === 'n/a' || handle.trim() === '') {
      return 'N/A';
    }
    return handle.startsWith('@') ? handle : `@${handle}`;
  };

  const formatXFollowers = (followers?: number) => {
    if (!followers || followers === 0) return 'N/A';
    return followers.toLocaleString();
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-nil-orange">
            Athlete Profile
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Detailed information for {athlete.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo Section */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nil-orange"></div>
                </div>
              )}
              
              {!imageError ? (
                <img
                  src={athlete.photo}
                  alt={`${athlete.name} - ${athlete.sport} athlete`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nil-light-blue to-nil-navy">
                  <User className="w-20 h-20 text-white opacity-60" />
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-nil-navy mb-2">
                {athlete.name}
              </h2>
              <Badge variant="secondary" className="bg-nil-orange text-white">
                {athlete.sport}
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Year */}
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Year:</span>
                  <span className="ml-2 text-gray-900">
                    {formatAcademicYear(athlete.year)}
                  </span>
                </div>
              </div>

              {/* College */}
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">College:</span>
                  <span className="ml-2 text-gray-900">{athlete.college}</span>
                </div>
              </div>

              {/* Hometown */}
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Hometown:</span>
                  <span className="ml-2 text-gray-900">{athlete.hometown}</span>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Gender:</span>
                  <span className="ml-2 text-gray-900">
                    {formatGender(athlete.gender)}
                  </span>
                </div>
              </div>

              {/* Instagram Section */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Instagram className="w-5 h-5 text-nil-orange flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-700">Instagram:</span>
                    {formatInstagramHandle(athlete.instagram_handle) !== 'N/A' ? (
                      <a 
                        href={`https://instagram.com/${athlete.instagram_handle?.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-nil-orange hover:text-nil-navy underline transition-colors"
                      >
                        {formatInstagramHandle(athlete.instagram_handle)}
                      </a>
                    ) : (
                      <span className="ml-2 text-gray-900">
                        {formatInstagramHandle(athlete.instagram_handle)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Instagram Followers as subfield - only show if Instagram handle exists */}
                {formatInstagramHandle(athlete.instagram_handle) !== 'N/A' && (
                  <div className="flex items-center space-x-3 ml-8">
                    <span className="text-gray-400 text-sm">└──</span>
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Followers:</span>
                      <span className="ml-2 text-gray-900 text-sm">
                        {formatInstagramFollowers(athlete.instagram_followers)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* TikTok Section */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Music className="w-5 h-5 text-nil-orange flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-700">TikTok:</span>
                    {formatTikTokHandle(athlete.tiktok_handle) !== 'N/A' ? (
                      <a 
                        href={`https://tiktok.com/@${athlete.tiktok_handle?.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-nil-orange hover:text-nil-navy underline transition-colors"
                      >
                        {formatTikTokHandle(athlete.tiktok_handle)}
                      </a>
                    ) : (
                      <span className="ml-2 text-gray-900">
                        {formatTikTokHandle(athlete.tiktok_handle)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* TikTok Followers as subfield - only show if TikTok handle exists */}
                {formatTikTokHandle(athlete.tiktok_handle) !== 'N/A' && (
                  <div className="flex items-center space-x-3 ml-8">
                    <span className="text-gray-400 text-sm">└──</span>
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Followers:</span>
                      <span className="ml-2 text-gray-900 text-sm">
                        {formatTikTokFollowers(athlete.tiktok_followers)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* X (Twitter) Section */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Twitter className="w-5 h-5 text-nil-orange flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-700">X (Twitter):</span>
                    {formatXHandle(athlete.x_handle) !== 'N/A' ? (
                      <a 
                        href={`https://x.com/${athlete.x_handle?.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-nil-orange hover:text-nil-navy underline transition-colors"
                      >
                        {formatXHandle(athlete.x_handle)}
                      </a>
                    ) : (
                      <span className="ml-2 text-gray-900">
                        {formatXHandle(athlete.x_handle)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* X Followers as subfield - only show if X handle exists */}
                {formatXHandle(athlete.x_handle) !== 'N/A' && (
                  <div className="flex items-center space-x-3 ml-8">
                    <span className="text-gray-400 text-sm">└──</span>
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Followers:</span>
                      <span className="ml-2 text-gray-900 text-sm">
                        {formatXFollowers(athlete.x_followers)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
