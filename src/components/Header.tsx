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
import ResetPasswordModal from "./ResetPasswordModal";
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, ChevronDown, LogOut, User, Shield, Trophy, Building2, Bell, Users, GraduationCap, Award } from 'lucide-react';
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

const roleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'Admin';
    case 'athlete': return 'Student Athlete';
    case 'high_school_athlete': return 'High School Athlete';
    case 'family_friend': return 'Family/Friends';
    case 'alumni': return 'Alumni';
    case 'brand': return 'Brand Representative';
    default: return role;
  }
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const { count: unreadCount } = useUnreadMessages();
  const navigate = useNavigate();
  const [previewsOpen, setPreviewsOpen] = useState(false);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [previews, setPreviews] = useState<Array<{ conversation_id: string; latest_message: any; unread_count: number }>>([]);

  const PARTICIPANT_ROLES = ['admin', 'athlete', 'high_school_athlete', 'family_friend', 'alumni'];

  const dashboardPath = (role: string | undefined) => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'athlete': return '/athlete/dashboard';
      case 'high_school_athlete': return '/highschool/dashboard';
      case 'family_friend': return '/family/dashboard';
      case 'alumni': return '/alumni/dashboard';
      default: return '/';
    }
  };

  // Load previews when dropdown opens
  useEffect(() => {
    const load = async () => {
      if (!previewsOpen || !user || !profile?.role || !PARTICIPANT_ROLES.includes(profile.role)) return;
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

  // Listen for custom event to open auth modal
  useEffect(() => {
    const handleOpenAuthModal = () => {
      setAuthModalOpen(true);
    };
    const handleOpenReset = () => {
      setResetModalOpen(true);
    };
    window.addEventListener('openAuthModal', handleOpenAuthModal);
    window.addEventListener('openResetPasswordModal', handleOpenReset);
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
      window.removeEventListener('openResetPasswordModal', handleOpenReset);
    };
  }, []);

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
            <img src="/logo.jpg" alt="ÑIL Hispanic™ Logo" className="h-11 w-auto" />
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-nil-navy hover:text-nil-orange transition-colors">About</Link>
          <Link to="/for-brands" className="text-nil-navy hover:text-nil-orange transition-colors">For Brands</Link>
          <Link to="/for-athletes" className="text-nil-navy hover:text-nil-orange transition-colors">For Athletes</Link>
          {/* Packages tab hidden - keep for future use */}
          {/* <Link to="/packages" className="text-nil-navy hover:text-nil-orange transition-colors">Packages</Link> */}
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Link to="/initiatives" className="flex items-center text-nil-navy hover:text-nil-orange transition-colors">
                Initiatives <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-48 p-1">
              <Link to="/initiatives/hola-houses" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100">HOLA Houses</Link>
              <Link to="/initiatives/soccer" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100">ÑILH Soccer</Link>
              <Link to="/initiatives/influencer-staffers" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100">Influencer Staffers</Link>
              <Link to="/initiatives/university-partnerships" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100">University Partnerships</Link>
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
              {/* Unread messages icon (desktop) for all messaging-enabled roles */}
              {profile?.role && PARTICIPANT_ROLES.includes(profile.role) && (
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
                                setPreviewsOpen(false);
                                const target = dashboardPath(profile?.role);
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
                          to={dashboardPath(profile?.role)}
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
                          {roleLabel(profile.role)}
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
                  {profile?.role === 'family_friend' && (
                    <Link to="/family/dashboard" className="flex items-center space-x-2 w-full px-2 py-2 text-sm rounded-sm hover:bg-gray-100">
                      <Users size={16} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {profile?.role === 'high_school_athlete' && (
                    <Link to="/highschool/dashboard" className="flex items-center space-x-2 w-full px-2 py-2 text-sm rounded-sm hover:bg-gray-100">
                      <GraduationCap size={16} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {profile?.role === 'alumni' && (
                    <Link to="/alumni/dashboard" className="flex items-center space-x-2 w-full px-2 py-2 text-sm rounded-sm hover:bg-gray-100">
                      <Award size={16} />
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
        
        {/* Mobile Actions: Login/User + Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-9 rounded-md bg-gray-200 animate-pulse" aria-label="Loading" />
          ) : user ? (
            <DropdownMenu onOpenChange={setPreviewsOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative flex items-center gap-2 px-3 h-9 rounded-md border border-gray-200 text-sm text-nil-navy hover:text-nil-orange hover:border-nil-orange transition-colors"
                  aria-label="User menu"
                >
                  <User size={16} />
                  <span className="max-w-[110px] truncate">{profile?.full_name || user.email}</span>
                  {profile?.role && PARTICIPANT_ROLES.includes(profile.role) && unreadCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] font-semibold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1">
                {/* Notifications Preview (mobile) */}
                {profile?.role && PARTICIPANT_ROLES.includes(profile.role) && (
                  <div className="py-2">
                    <div className="px-2 pb-1 text-xs font-semibold text-nil-navy">Unread messages</div>
                    {loadingPreviews ? (
                      <div className="px-2 py-2 text-xs text-gray-500">Loading...</div>
                    ) : previews.length === 0 ? (
                      <div className="px-2 py-2 text-xs text-gray-500">No unread messages</div>
                    ) : (
                      <div className="max-h-64 overflow-auto">
                        {previews.map((p) => (
                          <button
                            key={p.conversation_id}
                            onClick={async () => {
                              setPreviewsOpen(false);
                              const target = dashboardPath(profile?.role);
                              try { await ChatService.markConversationRead(p.conversation_id, user!.id); } catch {}
                              navigate(`${target}?openChat=${p.conversation_id}`);
                            }}
                            className="w-full text-left px-2 py-2 rounded hover:bg-gray-50 flex items-start gap-2"
                          >
                            <span className="mt-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] font-semibold">
                              {p.unread_count > 99 ? '99+' : p.unread_count}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 truncate">Conversation</div>
                              <div className="text-[11px] text-gray-600 truncate">{p.latest_message?.content || 'New message'}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="border-t mt-2" />
                    <div className="px-2 py-2">
                      <Link
                        to={dashboardPath(profile?.role)}
                        className="text-xs text-nil-orange hover:underline"
                      >
                        View all messages
                      </Link>
                    </div>
                  </div>
                )}
                {profile?.role && PARTICIPANT_ROLES.includes(profile.role) && <DropdownMenuSeparator />}
                {profile?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {profile?.role === 'athlete' && (
                  <DropdownMenuItem asChild>
                    <Link to="/athlete/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {profile?.role === 'brand' && (
                  <DropdownMenuItem asChild>
                    <Link to="/brand/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {profile?.role === 'family_friend' && (
                  <DropdownMenuItem asChild>
                    <Link to="/family/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {profile?.role === 'high_school_athlete' && (
                  <DropdownMenuItem asChild>
                    <Link to="/highschool/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {profile?.role === 'alumni' && (
                  <DropdownMenuItem asChild>
                    <Link to="/alumni/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="text-red-600 focus:text-red-700"
                >
                  <LogOut size={14} className="mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="px-3 h-9 rounded-md bg-nil-orange text-white text-sm hover:bg-nil-navy transition-colors"
              onClick={() => setAuthModalOpen(true)}
              aria-label="Login or Signup"
            >
              Login
            </button>
          )}

          <button 
            className="p-2 rounded-md text-nil-navy" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
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
            {/* Packages tab hidden - keep for future use */}
            {/* <Link to="/packages" className="px-8 py-3 hover:bg-nil-light-gray">Packages</Link> */}
            <Link to="/initiatives" className="px-8 py-3 hover:bg-nil-light-gray">Initiatives</Link>
            <Link to="/initiatives/hola-houses" className="pl-12 pr-8 py-3 hover:bg-nil-light-gray text-sm">HOLA Houses</Link>
            <Link to="/initiatives/soccer" className="pl-12 pr-8 py-3 hover:bg-nil-light-gray text-sm">ÑILH Soccer</Link>
            <Link to="/initiatives/influencer-staffers" className="pl-12 pr-8 py-3 hover:bg-nil-light-gray text-sm">Influencer Staffers</Link>
            <Link to="/initiatives/university-partnerships" className="pl-12 pr-8 py-3 hover:bg-nil-light-gray text-sm">University Partnerships</Link>
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
                          {roleLabel(profile.role)}
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
                  {profile?.role === 'family_friend' && (
                    <Link
                      to="/family/dashboard"
                      className="w-full text-left px-3 py-3 text-sm hover:bg-nil-light-gray flex items-center space-x-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users size={16} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {profile?.role === 'high_school_athlete' && (
                    <Link
                      to="/highschool/dashboard"
                      className="w-full text-left px-3 py-3 text-sm hover:bg-nil-light-gray flex items-center space-x-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <GraduationCap size={16} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {profile?.role === 'alumni' && (
                    <Link
                      to="/alumni/dashboard"
                      className="w-full text-left px-3 py-3 text-sm hover:bg-nil-light-gray flex items-center space-x-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Award size={16} />
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
      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      />
    </header>
  );
};

export default Header;
