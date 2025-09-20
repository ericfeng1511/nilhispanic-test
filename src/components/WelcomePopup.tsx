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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 sm:py-8 mx-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <DialogHeader className="text-center space-y-3 sm:space-y-4">
          <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-nil-navy leading-tight px-2">
            Own Your Brand.
          </DialogTitle>
          <DialogDescription className="text-base sm:text-lg md:text-xl text-nil-dark-gray font-normal leading-relaxed px-2">
            Hispanic Student-Athletes: Build your free profile today.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mt-6 sm:mt-8">
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
            className="text-sm text-nil-dark-gray hover:text-nil-navy transition-colors underline underline-offset-2 touch-manipulation py-2"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
