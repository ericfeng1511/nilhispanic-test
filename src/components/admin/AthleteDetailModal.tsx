import React, { useState, useEffect } from 'react';
import { StudentAthlete } from '@/types/studentAthlete';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Trophy, Calendar, Users, Instagram, Music, Twitter } from 'lucide-react';
import { formatAcademicYear, formatGender } from '@/utils/formatters';
import { CityService } from '@/services/cityService';
import { CollegeService } from '@/services/collegeService';

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
  const [formattedCity, setFormattedCity] = useState<string>('N/A');
  const [schoolName, setSchoolName] = useState<string>('');

  // Determine if the athlete has a valid photo URL
  const hasPhoto = !!(athlete?.photo && String(athlete.photo).trim() !== '');

  // Build cache-busted photo src when present
  const photoSrc = hasPhoto && athlete
    ? `${athlete.photo}${athlete.photo.includes('?') ? '&' : '?'}v=${encodeURIComponent(athlete.updated_at || '')}`
    : '';

  // Reset image state when athlete or photo changes
  useEffect(() => {
    if (!athlete) return;
    if (hasPhoto) {
      setImageError(false);
      setImageLoading(true);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [athlete?.id, athlete?.photo, hasPhoto]);

  // Load formatted hometown from city_id
  useEffect(() => {
    const loadCity = async () => {
      if (athlete?.city_id) {
        try {
          const city = await CityService.getCityById(athlete.city_id);
          if (city) {
            setFormattedCity(CityService.formatCityLabel(city));
          } else {
            setFormattedCity('N/A');
          }
        } catch (e) {
          setFormattedCity('N/A');
        }
      } else {
        setFormattedCity('N/A');
      }
    };
    loadCity();
  }, [athlete]);

  // Load school name from school_id
  useEffect(() => {
    let active = true;
    const loadSchool = async () => {
      if (athlete?.school_id) {
        try {
          const school = await CollegeService.getSchoolById(athlete.school_id);
          if (active) setSchoolName(school?.name || '');
        } catch (e) {
          if (active) setSchoolName('');
        }
      } else {
        if (active) setSchoolName('');
      }
    };
    loadSchool();
    return () => { active = false; };
  }, [athlete?.school_id]);

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
              {imageLoading && hasPhoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nil-orange"></div>
                </div>
              )}
              
              {!imageError && hasPhoto ? (
                <img
                  src={photoSrc}
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
                  <span className="ml-2 text-gray-900">{schoolName || athlete.college || 'N/A'}</span>
                </div>
              </div>

              {/* Hometown */}
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Hometown:</span>
                  <span className="ml-2 text-gray-900">{formattedCity}</span>
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
