import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react'; // Using lucide-react for icons

const POPUP_SEEN_KEY = 'hasSeenBrandWelcomePopup';

const BrandWelcomePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3; // For three different advertisements

  const popupContent = [
    "Placeholder for Advertisement 1: Welcome to For Brands! Discover amazing opportunities.",
    "Placeholder for Advertisement 2: Learn how our platform can elevate your brand.",
    "Placeholder for Advertisement 3: Get started today and connect with top talent."
  ];

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem(POPUP_SEEN_KEY);
    if (!hasSeenPopup) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(POPUP_SEEN_KEY, 'true');
  };

  const handleNext = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, totalSteps - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-md w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close popup"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center">
          Welcome to Our Brand Platform!
        </h2>

        <div className="mb-6 min-h-[100px] flex items-center justify-center">
          <p className="text-gray-700 text-center">{popupContent[currentStep]}</p>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <span
                key={index}
                className={`block w-2.5 h-2.5 rounded-full ${
                  currentStep === index ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === totalSteps - 1}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        {currentStep === totalSteps - 1 && (
             <button
                onClick={handleClose}
                className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-150"
            >
                Get Started
            </button>
        )}
      </div>
    </div>
  );
};

export default BrandWelcomePopup;
