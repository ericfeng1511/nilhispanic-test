import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink } from 'lucide-react';

interface SchedulingModalProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  calUsername?: string;
  source?: string; // To track which page/button initiated the booking
}

export const SchedulingModal = ({ 
  children, 
  title = "Schedule a Meeting",
  description = "Choose a time that works best for you and we'll connect to discuss your needs.",
  calUsername = "ericfeng1511", // Default Cal.com username
  source = "website" // Default source identifier
}: SchedulingModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-nil-orange" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 animate-pulse text-nil-orange" />
                <span className="text-gray-600">Loading calendar...</span>
              </div>
            </div>
          )}
          <iframe
            src={`https://cal.com/${calUsername}?embed=true&theme=light#source=${encodeURIComponent(source)}`}
            width="100%"
            height="500"
            frameBorder="0"
            onLoad={handleIframeLoad}
            className="rounded-lg"
            title="Schedule a meeting"
          />
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`https://cal.com/${calUsername}#source=${encodeURIComponent(source)}`, '_blank')}
            className="text-nil-orange border-nil-orange hover:bg-nil-orange hover:text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Extend Window interface for Cal.com
declare global {
  interface Window {
    Cal: any;
  }
}
