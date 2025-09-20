import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from 'lucide-react';

interface WelcomePopupProps {
  onSignUpClick: () => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onSignUpClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if this is the first visit to the homepage
    const hasSeenWelcomePopup = localStorage.getItem('nilhispanic-welcome-popup-seen');
    
    if (!hasSeenWelcomePopup) {
      // Show popup after a brief delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark as seen so it doesn't show again
    localStorage.setItem('nilhispanic-welcome-popup-seen', 'true');
  };

  const handleSignUpClick = () => {
    handleClose();
    onSignUpClick();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] rounded-lg relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-[url('/images/athlete-test-img-24.png')] bg-cover bg-center bg-no-repeat"></div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/70 to-nil-orange/60"></div>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white z-20"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="relative z-10 px-4 py-6 sm:px-6 sm:py-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight px-2">
              Own Your Brand.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 font-normal leading-relaxed px-2">
              Hispanic Student-Athletes: Build your free profile today.
            </p>
          </div>

          <div className="flex justify-center mt-20 sm:mt-24">
            <Button 
              onClick={handleSignUpClick}
              className="bg-nil-orange text-white hover:bg-nil-navy hover:text-white transition-colors px-6 py-3 sm:px-8 sm:py-4 h-auto text-base sm:text-lg font-semibold rounded-md w-full sm:w-auto sm:min-w-[200px] touch-manipulation"
            >
              Sign Up Now
            </Button>
          </div>

          {/* Optional: Add a subtle "No thanks" link */}
          <div className="text-center mt-4 sm:mt-6">
            <button
              onClick={handleClose}
              className="text-sm text-gray-300 hover:text-white transition-colors underline underline-offset-2 touch-manipulation py-2"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
