import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface InfoTooltipProps {
  variant?: 'mobile' | 'desktop';
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  variant = 'desktop', 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const mobileText = "Complete 100% of your profile so we can match you with NIL deals. Free, no obligation.";
  
  const desktopText = `Complete 100% of your profile to help ÑIL Hispanic match you with NIL opportunities.
We'll also share deal details here when available.
Always free, with no obligation or commitment.`;

  const displayText = variant === 'mobile' ? mobileText : desktopText;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors ${className}`}
        aria-label="More information"
      >
        <HelpCircle className="w-3 h-3 text-gray-600" />
      </button>

      {isOpen && (
        <>
          {/* Mobile: Full screen overlay */}
          {variant === 'mobile' && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:hidden">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="pr-8">
                  <h3 className="font-semibold text-nil-navy mb-3">Profile Information</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {displayText}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Desktop: Tooltip */}
          {variant === 'desktop' && (
            <>
              {/* Desktop tooltip */}
              <div className="hidden sm:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="pr-6">
                    <h3 className="font-semibold text-nil-navy mb-2 text-sm">Profile Information</h3>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                      {displayText}
                    </p>
                  </div>
                </div>
                {/* Arrow pointing up */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>
              </div>
              
              {/* Mobile: Full screen overlay */}
              <div className="block sm:hidden fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="pr-8">
                    <h3 className="font-semibold text-nil-navy mb-3">Profile Information</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {mobileText}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Backdrop for desktop only */}
              <div className="hidden sm:block fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            </>
          )}

          {/* Mobile fallback on desktop screens */}
          {variant === 'mobile' && (
            <>
              <div className="hidden sm:block absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="pr-6">
                    <h3 className="font-semibold text-nil-navy mb-2 text-sm">Profile Information</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {displayText}
                    </p>
                  </div>
                </div>
                {/* Arrow pointing up, positioned to align with button */}
                <div className="absolute bottom-full left-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>
              </div>
              {/* Backdrop for mobile fallback */}
              <div className="hidden sm:block fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            </>
          )}
        </>
      )}
    </div>
  );
};
