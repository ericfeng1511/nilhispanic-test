import React, { useState } from 'react';
import { StudentAthlete } from '@/types/studentAthlete';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { User, MapPin, Trophy } from 'lucide-react';

interface AthleteCardProps {
  athlete: StudentAthlete;
  onClick?: () => void;
  isSelected?: boolean;
  onSelectionChange?: (athleteId: string, selected: boolean) => void;
  selectionMode?: boolean;
}

export const AthleteCard: React.FC<AthleteCardProps> = ({ 
  athlete, 
  onClick, 
  isSelected = false, 
  onSelectionChange, 
  selectionMode = false 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleSelectionChange = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(athlete.id, checked);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on checkbox
    if ((e.target as HTMLElement).closest('[data-checkbox]')) {
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 cursor-pointer ${
        isSelected ? 'ring-2 ring-nil-orange bg-nil-orange/5' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Selection Checkbox */}
        {selectionMode && (
          <div className="absolute top-2 right-2 z-10" data-checkbox>
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelectionChange}
              className="bg-white border-2 border-gray-300 data-[state=checked]:bg-nil-orange data-[state=checked]:border-nil-orange"
            />
          </div>
        )}
        
        {/* Photo Section */}
        <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-gray-100">
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
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nil-light-blue to-nil-navy">
              <User className="w-16 h-16 text-white opacity-60" />
            </div>
          )}
          

        </div>

        {/* Info Section */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-nil-orange line-clamp-2 group-hover:text-nil-navy transition-colors">
            {athlete.name}
          </h3>
          
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{athlete.college}</span>
          </div>
          
          {/* Sport info row */}
          <div className="flex items-center justify-start text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span className="capitalize">{athlete.sport}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
