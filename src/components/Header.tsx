
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="py-4 bg-white fixed w-full z-50 shadow-sm">
      <div className="container-custom flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-nil-navy text-2xl font-bold">NIL<span className="text-nil-orange">Hispanic</span></h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#about" className="text-nil-navy hover:text-nil-orange transition-colors">About</a>
          <a href="#how-it-works" className="text-nil-navy hover:text-nil-orange transition-colors">How It Works</a>
          <a href="#athletes" className="text-nil-navy hover:text-nil-orange transition-colors">Athletes</a>
          <a href="#brands" className="text-nil-navy hover:text-nil-orange transition-colors">Brands</a>
          <a href="#contact" className="text-nil-navy hover:text-nil-orange transition-colors">Contact</a>
          <Button className="btn-primary">Schedule Meeting</Button>
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
            <a href="#about" className="px-8 py-3 hover:bg-nil-light-gray">About</a>
            <a href="#how-it-works" className="px-8 py-3 hover:bg-nil-light-gray">How It Works</a>
            <a href="#athletes" className="px-8 py-3 hover:bg-nil-light-gray">Athletes</a>
            <a href="#brands" className="px-8 py-3 hover:bg-nil-light-gray">Brands</a>
            <a href="#contact" className="px-8 py-3 hover:bg-nil-light-gray">Contact</a>
            <div className="px-8 py-3">
              <Button className="btn-primary w-full">Schedule Meeting</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
