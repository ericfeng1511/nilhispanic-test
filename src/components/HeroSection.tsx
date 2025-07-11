import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroButtonProps {
  text: string | React.ReactNode;
  link: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'default' | 'lg';
}

interface HeroSectionProps {
  title: React.ReactNode;
  subtitle?: string;
  backgroundImageUrl: string;
  backgroundPosition?: string;
  buttons?: HeroButtonProps[];
  children?: React.ReactNode;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  backgroundImageUrl,
  backgroundPosition = 'center',
  buttons,
  children,
  className = '',
}) => {
  return (
    <section
      className={`relative pt-28 pb-48 bg-cover bg-no-repeat md:bg-fixed ${className}`}
      style={{ 
        backgroundImage: `url(${backgroundImageUrl})`, 
        backgroundPosition: backgroundPosition,
        backgroundSize: 'cover'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
      <div className="relative z-10 container-custom flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 mt-40 text-gray-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl">
              {subtitle}
            </p>
          )}
          {buttons && buttons.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-start">
              {buttons.map((button, index) => {
                const buttonClasses = `transition-colors duration-500 ${button.size ? '' : 'w-full'} ${button.className || ''}`;
                if (button.onClick) {
                  return (
                    <Button 
                      key={index}
                      variant={button.variant || 'default'} 
                      size={button.size || 'default'}
                      className={buttonClasses}
                      onClick={button.onClick}
                    >
                      {button.text}
                    </Button>
                  );
                } else {
                  return (
                    <Link to={button.link} key={index}>
                      <Button 
                        variant={button.variant || 'default'} 
                        size={button.size || 'default'}
                        className={buttonClasses}
                      >
                        {button.text}
                      </Button>
                    </Link>
                  );
                }
              })}
            </div>
          )}
        </div>
        <div className="md:w-1/2 flex justify-center">
          {/* Placeholder for potential image or other content on the right */}
        </div>
      </div>
      {children && <div className="relative z-10 container-custom mt-12">{children}</div>}
    </section>
  );
};

export default HeroSection;
