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
import { Menu, ChevronDown, LogOut, User, Settings, Shield, Trophy, Building2, Bell } from 'lucide-react';
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
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { ChatService } from '@/services/chatService';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const { count: unreadCount } = useUnreadMessages();
  const navigate = useNavigate();
  const [previewsOpen, setPreviewsOpen] = useState(false);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [previews, setPreviews] = useState<Array<{ conversation_id: string; latest_message: any; unread_count: number }>>([]);

  // Load previews when dropdown opens
  useEffect(() => {
    const load = async () => {
      if (!previewsOpen || !user || !profile?.role || (profile.role !== 'admin' && profile.role !== 'athlete')) return;
      setLoadingPreviews(true);
      try {
        const res = await ChatService.getUnreadPreviewsForUser(user.id, profile.role as any, 1, 20);
        setPreviews(res);
      } catch (e) {
        console.warn('Failed to load unread previews', e);
        setPreviews([]);
      } finally {
        setLoadingPreviews(false);
      }
    };
    load();
  }, [previewsOpen, user?.id, profile?.role]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [mobileMenuOpen]);

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
              {/* Unread messages icon (desktop) for admins and athletes */}
              {(profile?.role === 'admin' || profile?.role === 'athlete') && (
                <DropdownMenu onOpenChange={setPreviewsOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Messages"
                      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-nil-navy hover:text-nil-orange hover:border-nil-orange transition-colors"
                      title="Messages"
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] text-center font-semibold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0">
                    <div className="py-2">
                      <div className="px-3 py-2 text-sm font-semibold text-nil-navy">Unread messages</div>
                      {loadingPreviews ? (
                        <div className="px-3 py-4 text-sm text-gray-500">Loading...</div>
                      ) : previews.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-gray-500">No unread messages</div>
                      ) : (
                        <div className="max-h-80 overflow-auto">
                          {previews.map((p) => (
                            <button
                              key={p.conversation_id}
                              onClick={async () => {
                                // Optimistic close dropdown and navigate
                                setPreviewsOpen(false);
                                const target = profile.role === 'admin' ? '/admin/dashboard' : '/athlete/dashboard';
                                // Optionally mark read immediately; dashboard will also mark upon open
                                try { await ChatService.markConversationRead(p.conversation_id, user!.id); } catch {}
                                navigate(`${target}?openChat=${p.conversation_id}`);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-3"
                            >
                              <div className="mt-1">
                                <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[20px] font-semibold">
                                  {p.unread_count > 99 ? '99+' : p.unread_count}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">Conversation</div>
                                <div className="text-xs text-gray-600 truncate">{p.latest_message?.content || 'New message'}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="border-t mt-2" />
                      <div className="px-3 py-2">
                        <Link
                          to={profile.role === 'admin' ? '/admin/dashboard' : '/athlete/dashboard'}
                          className="text-sm text-nil-orange hover:underline"
                        >
                          View all messages
                        </Link>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {/* User Profile Dropdown */}
              <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <button className="flex items-center space-x-2 text-nil-navy hover:text-nil-orange transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
                    <User size={18} />
                    <div className="text-left">
                      <div className="text-sm font-medium">
                        {profile?.full_name || user.email}
                      </div>
                      {profile?.role && (
                        <div className="text-xs text-gray-600">
                          {profile.role}
                        </div>
                      )}
                    </div>
                    <ChevronDown size={16} />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent align="end" className="w-48 p-1">
                  {/* Dashboard Link */}
                  {profile?.role === 'admin' && (
                    <Link to="/admin/dashboard" className="flex items-center space-x-2 w-full px-2 py-2 text-sm rounded-sm hover:bg-gray-100">
                      <Shield size={16} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {profile?.role === 'athlete' && (
                    <Link to="/athlete/dashboard" className="flex items-center space-x-2 w-full px-2 py-2 text-sm rounded-sm hover:bg-gray-100">
                      <Trophy size={16} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {profile?.role === 'brand' && (
                    <Link to="/brand/dashboard" className="flex items-center space-x-2 w-full px-2 py-2 text-sm rounded-sm hover:bg-gray-100">
                      <Building2 size={16} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  <div className="border-t border-gray-200 my-1" />
                  {/* Logout */}
                  <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-2 py-2 text-sm rounded-sm hover:bg-gray-100 text-red-600">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </HoverCardContent>
              </HoverCard>
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
        <div
          className="md:hidden fixed left-0 right-0 top-[64px] bottom-0 bg-white shadow-md animate-fade-in overflow-y-auto overscroll-contain"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}
        >
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
                  {/* User Profile Section */}
                  <div className="flex items-center space-x-2 text-nil-navy px-3 py-2 bg-gray-50 rounded-md">
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
                  
                  {/* Dashboard Link */}
                  {profile?.role === 'admin' && (
                    <Link 
                      to="/admin/dashboard" 
                      className="w-full text-left px-3 py-3 text-sm hover:bg-nil-light-gray flex items-center space-x-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield size={16} />
                      <span className="flex items-center gap-2">
                        Dashboard
                        {unreadCount > 0 && (
                          <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] font-semibold">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </span>
                    </Link>
                  )}
                  {profile?.role === 'athlete' && (
                    <Link 
                      to="/athlete/dashboard" 
                      className="w-full text-left px-3 py-3 text-sm hover:bg-nil-light-gray flex items-center space-x-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Trophy size={16} />
                      <span className="flex items-center gap-2">
                        Dashboard
                        {unreadCount > 0 && (
                          <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] font-semibold">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </span>
                    </Link>
                  )}
                  {profile?.role === 'brand' && (
                    <Link 
                      to="/brand/dashboard" 
                      className="w-full text-left px-3 py-3 text-sm hover:bg-nil-light-gray flex items-center space-x-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Building2 size={16} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  
                  {/* Separator */}
                  <div className="border-t border-gray-200"></div>
                  
                  {/* Logout Button */}
                  <Button 
                    onClick={handleLogout}
                    className="bg-red-500 text-white hover:bg-red-600 transition-colors w-full h-12 touch-manipulation font-medium flex items-center justify-center space-x-2 mb-8"
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
