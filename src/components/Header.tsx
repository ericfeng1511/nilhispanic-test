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
import { Menu, ChevronDown, LogOut, User, Settings, Shield, Trophy, Building2, MessageSquare } from 'lucide-react';
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
              {/* Unread messages icon (desktop) for admins and athletes */}
              {(profile?.role === 'admin' || profile?.role === 'athlete') && (
                <DropdownMenu onOpenChange={setPreviewsOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Messages"
                      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-nil-navy hover:text-nil-orange hover:border-nil-orange transition-colors"
                      title="Messages"
                    >
                      <MessageSquare size={18} />
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
              {/* Admin Dashboard Button - Only visible to admin users */}
              {profile?.role === 'admin' && (
                <Link to="/admin/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-nil-navy text-white hover:bg-nil-orange border-nil-navy hover:border-nil-orange transition-colors flex items-center space-x-1"
                  >
                    <Shield size={16} />
                    <span>Dashboard</span>
                  </Button>
                </Link>
              )}
              {/* Athlete Dashboard Button - Only visible to athlete users */}
              {profile?.role === 'athlete' && (
                <Link to="/athlete/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-nil-navy text-white hover:bg-nil-orange border-nil-navy hover:border-nil-orange transition-colors flex items-center space-x-1"
                  >
                    <Trophy size={16} />
                    <span>Dashboard</span>
                  </Button>
                </Link>
              )}
              {/* Brand Dashboard Button - Only visible to brand users */}
              {profile?.role === 'brand' && (
                <Link to="/brand/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-nil-navy text-white hover:bg-nil-orange border-nil-navy hover:border-nil-orange transition-colors flex items-center space-x-1"
                  >
                    <Building2 size={16} />
                    <span>Dashboard</span>
                  </Button>
                </Link>
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
                        <span className="flex items-center gap-2">
                          Dashboard
                          {unreadCount > 0 && (
                            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] font-semibold">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </span>
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
                  {/* Athlete Dashboard for Mobile - Only visible to athlete users */}
                  {profile?.role === 'athlete' && (
                    <div className="space-y-2">
                      <div className="text-xs text-nil-navy font-medium px-3 mb-2">Athlete Panel</div>
                      <Link to="/athlete/dashboard" className="w-full text-left px-3 py-2 text-sm hover:bg-nil-light-gray flex items-center space-x-2">
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
                      <div className="border-t border-gray-200 my-2"></div>
                    </div>
                  )}
                  {/* Brand Dashboard for Mobile - Only visible to brand users */}
                  {profile?.role === 'brand' && (
                    <div className="space-y-2">
                      <div className="text-xs text-nil-navy font-medium px-3 mb-2">Brand Panel</div>
                      <Link to="/brand/dashboard" className="w-full text-left px-3 py-2 text-sm hover:bg-nil-light-gray flex items-center space-x-2">
                        <Building2 size={16} />
                        <span>Dashboard</span>
                      </Link>
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
