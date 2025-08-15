import React, { useState } from 'react';
import { SchoolContact } from '@/types/schoolContact';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Mail, User } from 'lucide-react';

interface ContactCardProps {
  contact: SchoolContact;
  onClick?: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Photo Section */}
        <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nil-orange"></div>
            </div>
          )}
          
          {!imageError ? (
            <img
              src={contact.photo || ''} // Fallback to empty string to trigger onError
              alt={contact.name}
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
        <h3 className="font-bold text-lg text-nil-orange line-clamp-2 group-hover:text-nil-navy transition-colors">
          {contact.name}
        </h3>

        <div className="space-y-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {contact.title}
          </p>

          <div className="flex items-center text-gray-600 text-sm">
            <Building2 className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{contact.college}</span>
          </div>

          <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <a href={`mailto:${contact.email}`} className="text-xs text-gray-600 line-clamp-1 hover:underline">
              {contact.email}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
