import React, { useState, useEffect } from 'react';
import { HighSchoolAthleteUser } from '@/services/highSchoolAthleteService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { User, MapPin, Instagram, Globe, Mail, GraduationCap } from 'lucide-react';
import { CityService } from '@/services/cityService';

interface HsAthleteDetailModalProps {
  user: HighSchoolAthleteUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HsAthleteDetailModal: React.FC<HsAthleteDetailModalProps> = ({ user, isOpen, onClose }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [formattedCity, setFormattedCity] = useState<string>('');

  const hasPhoto = !!(user?.photo && user.photo.trim() !== '');

  useEffect(() => {
    if (!user) return;
    if (hasPhoto) { setImageError(false); setImageLoading(true); }
    else { setImageError(true); setImageLoading(false); }
  }, [user?.id, user?.photo, hasPhoto]);

  useEffect(() => {
    if (!user) return;
    setFormattedCity('');
    const load = async () => {
      // HS athletes store city_id indirectly via hometown text; use hometown directly
      setFormattedCity(user.hometown || '');
    };
    load();
  }, [user?.id]);

  if (!user) return null;

  const gradeLabel =
    user.grade === 9 ? '9th Grade (Freshman)' :
    user.grade === 10 ? '10th Grade (Sophomore)' :
    user.grade === 11 ? '11th Grade (Junior)' :
    user.grade === 12 ? '12th Grade (Senior)' : 'N/A';

  const fmtInstagram = (h?: string | null) =>
    h && h.trim() && h.toLowerCase() !== 'n/a'
      ? (h.startsWith('@') ? h : `@${h}`)
      : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-nil-orange">
            {user.full_name || 'No name'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">{user.email}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            {imageLoading && hasPhoto && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nil-orange" />
              </div>
            )}
            {!imageError && hasPhoto ? (
              <img
                src={user.photo!}
                alt={user.full_name || 'HS Athlete'}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={() => { setImageError(true); setImageLoading(false); }}
                onLoad={() => setImageLoading(false)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nil-orange to-nil-navy">
                <User className="w-20 h-20 text-white opacity-60" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Sport:</span>
                  <span className="ml-2 text-gray-900">{user.sport || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Grade:</span>
                  <span className="ml-2 text-gray-900">{gradeLabel}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Age:</span>
                  <span className="ml-2 text-gray-900">{user.age ?? 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Hometown:</span>
                  <span className="ml-2 text-gray-900">{formattedCity || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Cultural Roots:</span>
                  <span className="ml-2 text-gray-900">
                    {Array.isArray(user.cultural_roots) && user.cultural_roots.length > 0
                      ? user.cultural_roots.join(', ')
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Instagram className="w-5 h-5 text-nil-orange flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Instagram:</span>
                  {fmtInstagram(user.instagram_handle) ? (
                    <a
                      href={`https://instagram.com/${user.instagram_handle!.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-nil-orange hover:text-nil-navy underline transition-colors"
                    >
                      {fmtInstagram(user.instagram_handle)}
                    </a>
                  ) : (
                    <span className="ml-2 text-gray-900">N/A</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
