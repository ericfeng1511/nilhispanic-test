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
import { AuthModal } from "./AuthModal";
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, ChevronDown, LogOut, User, Settings, Shield } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  const handleLogout = () => {
    // 1. Clear UI state immediately
    setMobileMenuOpen(false);
    
    // 2. Fire-and-forget sign-out (don't await)
    signOut().catch(error => {
      console.error('Logout error (handled):', error);
    });
  };

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
            <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Contact Us</DialogTitle>
                <DialogDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </DialogDescription>
              </DialogHeader>
              <ContactForm />
            </DialogContent>
          </Dialog>
          {loading ? (
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-md font-medium animate-pulse">
              Loading...
            </div>
          ) : user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-nil-navy">
                <User size={18} />
                <span className="text-sm font-medium">
                  {profile?.full_name || user.email}
                </span>
                {profile?.role && (
                  <span className="text-xs bg-nil-light-blue text-nil-navy px-2 py-1 rounded-full">
                    {profile.role}
                  </span>
                )}
              </div>
              {/* Admin Dropdown - Only visible to admin users */}
              {profile?.role === 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-nil-navy text-white hover:bg-nil-orange border-nil-navy hover:border-nil-orange transition-colors flex items-center space-x-1"
                    >
                      <Shield size={16} />
                      <span>Admin</span>
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <Link to="/admin/dashboard" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Manage Users</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>System Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button 
                onClick={handleLogout}
                className="bg-red-500 text-white hover:bg-red-600 transition-colors px-3 py-2 rounded-md font-medium flex items-center space-x-1"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setAuthModalOpen(true)}
              className="bg-nil-orange text-white hover:bg-nil-navy hover:text-white transition-colors px-4 py-2 rounded-md font-medium"
            >
              Login / Signup
            </Button>
          )}
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="btn-primary w-full h-12 touch-manipulation">
                    Contact Us
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Contact Us</DialogTitle>
                    <DialogDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </DialogDescription>
                  </DialogHeader>
                  <ContactForm />
                </DialogContent>
              </Dialog>
            </div>
            <div className="px-8 py-3">
              {loading ? (
                <div className="bg-gray-200 text-gray-600 w-full h-12 rounded-md font-medium flex items-center justify-center animate-pulse">
                  Loading...
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-nil-navy px-3">
                    <User size={18} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {profile?.full_name || user.email}
                      </div>
                      {profile?.role && (
                        <div className="text-xs text-gray-600">
                          {profile.role}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Admin Dropdown for Mobile - Only visible to admin users */}
                  {profile?.role === 'admin' && (
                    <div className="space-y-2">
                      <div className="text-xs text-nil-navy font-medium px-3 mb-2">Admin Panel</div>
                      <Link to="/admin/dashboard" className="w-full text-left px-3 py-2 text-sm hover:bg-nil-light-gray flex items-center space-x-2">
                        <Settings size={16} />
                        <span>Dashboard</span>
                      </Link>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-nil-light-gray flex items-center space-x-2">
                        <User size={16} />
                        <span>Manage Users</span>
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-nil-light-gray flex items-center space-x-2">
                        <Shield size={16} />
                        <span>System Settings</span>
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                    </div>
                  )}
                  <Button 
                    onClick={handleLogout}
                    className="bg-red-500 text-white hover:bg-red-600 transition-colors w-full h-12 touch-manipulation font-medium flex items-center justify-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-nil-orange text-white hover:bg-nil-navy hover:text-white transition-colors w-full h-12 touch-manipulation font-medium"
                >
                  Login / Signup
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </header>
  );
};

export default Header;
