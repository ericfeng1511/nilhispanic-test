import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm } from "./ContactForm";
import { Link } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="py-4 bg-white fixed w-full z-50 shadow-md">
      <div className="container-custom flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" aria-label="Go to homepage">
            <img src="/logo.jpg" alt="NILHispanic Logo" className="h-11 w-auto" />
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-nil-navy hover:text-nil-orange transition-colors">About</Link>
          <Link to="/for-brands" className="text-nil-navy hover:text-nil-orange transition-colors">For Brands</Link>
          <Link to="/for-athletes" className="text-nil-navy hover:text-nil-orange transition-colors">For Athletes</Link>
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Link to="/initiatives" className="flex items-center text-nil-navy hover:text-nil-orange transition-colors">
                Initiatives <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-48 p-1">
              <Link to="/initiatives/collective" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100">ÑILH Collective</Link>
              <Link to="/initiatives/hola-houses" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100">HOLA Houses</Link>
              <Link to="/initiatives/soccer" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100">ÑILH Soccer</Link>
              <Link to="/initiatives/influencer-staffers" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100">Influencer Staffers</Link>
            </HoverCardContent>
          </HoverCard>
          <Link to="/work-with-us" className="text-nil-navy hover:text-nil-orange transition-colors">Work With Us</Link>
                    <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-primary">Contact Us</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Contact Us</DialogTitle>
                <DialogDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </DialogDescription>
              </DialogHeader>
              <ContactForm />
            </DialogContent>
          </Dialog>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md text-nil-navy" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md mt-2 animate-fade-in">
          <nav className="flex flex-col py-4">
            <Link to="/" className="px-8 py-3 hover:bg-nil-light-gray">About</Link>
            <Link to="/for-brands" className="px-8 py-3 hover:bg-nil-light-gray">For Brands</Link>
            <Link to="/for-athletes" className="px-8 py-3 hover:bg-nil-light-gray">For Athletes</Link>
            <Link to="/initiatives" className="px-8 py-3 hover:bg-nil-light-gray">Initiatives</Link>
            <Link to="/initiatives/collective" className="pl-12 pr-8 py-3 hover:bg-nil-light-gray text-sm">ÑILH Collective</Link>
            <Link to="/initiatives/hola-houses" className="pl-12 pr-8 py-3 hover:bg-nil-light-gray text-sm">HOLA Houses</Link>
            <Link to="/initiatives/soccer" className="pl-12 pr-8 py-3 hover:bg-nil-light-gray text-sm">ÑILH Soccer</Link>
            <Link to="/initiatives/influencer-staffers" className="pl-12 pr-8 py-3 hover:bg-nil-light-gray text-sm">Influencer Staffers</Link>
            <Link to="/work-with-us" className="px-8 py-3 hover:bg-nil-light-gray">Work With Us</Link>
            <div className="px-8 py-3">
              <Button className="btn-primary w-full">Contact Us</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
