import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { User, Trophy, Calendar, MessageSquare, Settings, BarChart3, Edit3, Save, X, ArrowLeft, Camera, Upload, Instagram, Twitter, Trash2, AlertTriangle, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentAthletes } from '@/hooks/useStudentAthletes';
import { StudentAthleteService } from '@/services/studentAthleteService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ChatWindow from '@/components/chat/ChatWindow';
import GroupChatList from '@/components/chat/GroupChatList';
import GroupChatWindow from '@/components/chat/GroupChatWindow';
import { ChatService } from '@/services/chatService';
import { ChatGroupService } from '@/services/chatGroupService';
import { useToast } from '@/hooks/use-toast';
import type { Conversation } from '@/types/chat';
import type { GroupConversation } from '@/types/chatGroup';
import { CityService, type City } from '@/services/cityService';
import { CollegeService } from '@/services/collegeService';
import { InfoTooltip } from '@/components/InfoTooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import PhotoCropperModal from '@/components/PhotoCropperModal';

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
  </svg>
);

// Cultural Roots options
const CULTURAL_ROOT_OPTIONS = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Dominican Republic',
  'Ecuador',
  'El Salvador',
  'Guatemala',
  'Honduras',
  'Mexico',
  'Nicaragua',
  'Panama',
  'Paraguay',
  'Peru',
  'Puerto Rico',
  'Spain',
  'Uruguay',
  'Venezuela',
  'Other',
];

interface AthleteProfile {
  sport: string;
  year: 'FR' | 'SO' | 'JR' | 'SR' | 'RFR' | 'GR' | '';
  college: string;
  hometown: string;
  gender: 'M' | 'F' | '';
  photo?: string;
  instagram_handle?: string;
  instagram_followers?: number;
  tiktok_handle?: string;
  tiktok_followers?: number;
  x_handle?: string;
  x_followers?: number;
  city_id?: number;
  school_id?: number;
  cultural_roots?: string[];
}

const AthleteDashboard: React.FC = () => {
  const { profile, loading: authLoading, user } = useAuth();
  const { allAthletes, uniqueSports, uniqueColleges } = useStudentAthletes();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile>({
    sport: '',
    year: '',
    college: '',
    hometown: '',
    gender: '',
    photo: '',
    instagram_handle: '',
    instagram_followers: undefined,
    tiktok_handle: '',
    tiktok_followers: undefined,
    x_handle: '',
    x_followers: undefined,
    city_id: undefined,
    school_id: undefined,
    cultural_roots: []
  });
  
  // Photo upload state
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  
  // Autocomplete suggestions
  const [sportSuggestions, setSportSuggestions] = useState<string[]>([]);
  const [collegeSuggestions, setCollegeSuggestions] = useState<string[]>([]);
  const [showSportSuggestions, setShowSportSuggestions] = useState(false);
  const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
  // City autocomplete state
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const citySearchTimeout = useRef<number | null>(null);
  const [selectedCityLabel, setSelectedCityLabel] = useState<string>('');
  // School autocomplete state
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolSuggestions, setSchoolSuggestions] = useState<Array<{ id: number; name: string }>>([]);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const schoolSearchTimeout = useRef<number | null>(null);
  const [selectedSchoolLabel, setSelectedSchoolLabel] = useState<string>('');
  
  // Original values for cancel functionality
  const [originalCityQuery, setOriginalCityQuery] = useState<string>('');
  const [originalSchoolQuery, setOriginalSchoolQuery] = useState<string>('');
  const [originalSelectedCityLabel, setOriginalSelectedCityLabel] = useState<string>('');
  const [originalSelectedSchoolLabel, setOriginalSelectedSchoolLabel] = useState<string>('');

  // Independent Social editing state and originals
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [originalInstagramHandle, setOriginalInstagramHandle] = useState<string | undefined>(undefined);
  const [originalInstagramFollowers, setOriginalInstagramFollowers] = useState<number | undefined>(undefined);
  const [originalTiktokHandle, setOriginalTiktokHandle] = useState<string | undefined>(undefined);
  const [originalTiktokFollowers, setOriginalTiktokFollowers] = useState<number | undefined>(undefined);
  const [originalXHandle, setOriginalXHandle] = useState<string | undefined>(undefined);
  const [originalXFollowers, setOriginalXFollowers] = useState<number | undefined>(undefined);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  // Groups state for Messages modal
  const [messagesMode, setMessagesMode] = useState<'direct' | 'groups'>('direct');
  const [groups, setGroups] = useState<GroupConversation[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroupTitle, setSelectedGroupTitle] = useState<string | null>(null);
  // Search state for chat modal lists
  const [directSearch, setDirectSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  // Unread tracking
  const [unreadConvoIds, setUnreadConvoIds] = useState<Set<string>>(new Set());
  const [groupLastReadMap, setGroupLastReadMap] = useState<Record<string, string | null | undefined>>({});
  
  // Fetch current athlete data
  const { data: currentAthleteData, isLoading: athleteLoading, error: athleteError } = useQuery({
    queryKey: ['athlete-profile', profile?.id],
    queryFn: () => profile?.id ? StudentAthleteService.fetchStudentAthleteByProfileId(profile.id) : null,
    enabled: !!profile?.id && profile?.role === 'athlete',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Photo upload mutation
  const photoUploadMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!profile?.id) throw new Error('No profile ID available');
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `athlete-photos/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('athlete-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Failed to upload photo: ${error.message}`);
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('athlete-photos')
        .getPublicUrl(filePath);
      
      return publicUrl;
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Pick<AthleteProfile, 'sport' | 'year' | 'college' | 'hometown' | 'gender' | 'photo' | 'instagram_handle' | 'instagram_followers' | 'tiktok_handle' | 'tiktok_followers' | 'x_handle' | 'x_followers' | 'city_id' | 'school_id' | 'cultural_roots'>>) => {
      if (!profile?.id) throw new Error('No profile ID available');
      
      // Handle photo upload if there's a selected photo
      let photoUrl = updates.photo;
      if (selectedPhoto) {
        console.log('Uploading photo...');
        photoUrl = await photoUploadMutation.mutateAsync(selectedPhoto);
        console.log('Photo uploaded successfully:', photoUrl);
      }
      
      // Explicitly include ids as number or null to avoid being dropped
      const finalUpdates: any = {
        ...updates,
        photo: photoUrl,
        city_id: typeof athleteProfile.city_id === 'number' ? athleteProfile.city_id : null,
        school_id: typeof athleteProfile.school_id === 'number' ? athleteProfile.school_id : null,
        cultural_roots: Array.isArray(updates.cultural_roots ?? athleteProfile.cultural_roots) ? (updates.cultural_roots ?? athleteProfile.cultural_roots) : null,
      };
      console.log('Submitting updates:', finalUpdates);
      
      // If no athlete record exists, create one
      if (!currentAthleteData) {
        return StudentAthleteService.createStudentAthlete(
          profile.id,
          profile.full_name || 'Unknown',
          finalUpdates
        );
      }
      
      // Otherwise update existing record
      return StudentAthleteService.updateStudentAthlete(profile.id, finalUpdates);
    },
    onSuccess: () => {
      // Invalidate and refetch athlete data
      queryClient.invalidateQueries({ queryKey: ['athlete-profile', profile?.id] });
      // Also invalidate the main student athletes list to update autocomplete suggestions
      queryClient.invalidateQueries({ queryKey: ['student-athletes'] });
      // Reset photo upload state
      setSelectedPhoto(null);
      setPhotoPreview(null);
      setIsEditing(false);
      console.log('✅ Athlete profile updated successfully!');
      // Force a full page reload to ensure the latest profile image is displayed immediately
      // This is a pragmatic solution to bypass any caching/stale state across components
      try {
        window.location.reload();
      } catch {
        // no-op
      }
    },
    onError: (error) => {
      console.error('❌ Error updating athlete profile:', error);
    }
  });
  
  // Load existing data into form when athlete data is fetched
  useEffect(() => {
    if (!currentAthleteData) return;
    
    setAthleteProfile({
      sport: currentAthleteData.sport || '',
      year: (currentAthleteData.year as 'FR' | 'SO' | 'JR' | 'SR' | 'RFR' | 'GR') || '',
      college: currentAthleteData.college || '',
      hometown: currentAthleteData.hometown || '',
      gender: (currentAthleteData.gender as 'M' | 'F') || '',
      photo: currentAthleteData.photo || '',
      instagram_handle: currentAthleteData.instagram_handle || '',
      instagram_followers: currentAthleteData.instagram_followers || undefined,
      tiktok_handle: currentAthleteData.tiktok_handle || '',
      tiktok_followers: currentAthleteData.tiktok_followers || undefined,
      x_handle: currentAthleteData.x_handle || '',
      x_followers: currentAthleteData.x_followers || undefined,
      city_id: (currentAthleteData as any).city_id || undefined,
      school_id: (currentAthleteData as any).school_id || undefined,
      cultural_roots: (currentAthleteData as any).cultural_roots || []
    });
    
    // Load city and school data asynchronously without causing re-renders
    const loadCityData = async () => {
      const cid = (currentAthleteData as any).city_id as number | undefined;
      if (cid) {
        try {
          const city = await CityService.getCityById(cid);
          if (city) {
            const label = CityService.formatCityLabel(city);
            setSelectedCityLabel(label);
            setCityQuery(label);
          } else {
            setSelectedCityLabel('');
            setCityQuery(currentAthleteData.hometown || '');
          }
        } catch {
          setSelectedCityLabel('');
          setCityQuery(currentAthleteData.hometown || '');
        }
      } else {
        setSelectedCityLabel('');
        setCityQuery(currentAthleteData.hometown || '');
      }
    };

    const loadSchoolData = async () => {
      const sid = (currentAthleteData as any).school_id as number | undefined;
      if (sid) {
        try {
          const school = await CollegeService.getSchoolById(sid);
          if (school) {
            setSelectedSchoolLabel(school.name);
            setSchoolQuery(school.name);
          } else {
            setSelectedSchoolLabel('');
            setSchoolQuery(currentAthleteData.college || '');
          }
        } catch {
          setSelectedSchoolLabel('');
          setSchoolQuery(currentAthleteData.college || '');
        }
      } else {
        setSelectedSchoolLabel('');
        setSchoolQuery(currentAthleteData.college || '');
      }
    };

    loadCityData();
    loadSchoolData();
  }, [currentAthleteData?.id]); // Only depend on the ID to prevent infinite loops
  
  // Get unique sports and colleges from existing data
  useEffect(() => {
    if (uniqueSports && uniqueColleges) {
      setSportSuggestions(uniqueSports);
      setCollegeSuggestions(uniqueColleges);
    }
  }, [uniqueSports, uniqueColleges]);
  
  // Filter suggestions based on input
  const getFilteredSportSuggestions = (input: string) => {
    return sportSuggestions.filter(sport => 
      sport && sport.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  };

  // Open a specific conversation if openChat query param is present
  useEffect(() => {
    const convoId = searchParams.get('openChat');
    if (convoId && profile?.id && profile.role === 'athlete') {
      setIsChatOpen(true);
      setChatConversationId(convoId);
      // Mark as read for current user (athlete)
      ChatService.markConversationRead(convoId, profile.id).catch(() => {});
      // Remove query param to avoid reopening
      const sp = new URLSearchParams(searchParams);
      sp.delete('openChat');
      setSearchParams(sp, { replace: true });
    }
  }, [searchParams, profile?.id, profile?.role]);
  
  const getFilteredCollegeSuggestions = (input: string) => {
    return collegeSuggestions.filter(college => 
      college && college.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  };
  
  const handleSave = () => {
    console.log('Saving athlete profile:', athleteProfile);
    updateMutation.mutate(athleteProfile);
  };
  
  const handleCancel = () => {
    // Reset form to original data or empty if no data exists
    if (currentAthleteData) {
      setAthleteProfile({
        sport: currentAthleteData.sport || '',
        year: (currentAthleteData.year as 'FR' | 'SO' | 'JR' | 'SR' | 'RFR' | 'GR') || '',
        college: currentAthleteData.college || '',
        hometown: currentAthleteData.hometown || '',
        gender: (currentAthleteData.gender as 'M' | 'F') || '',
        photo: currentAthleteData.photo || '',
        instagram_handle: currentAthleteData.instagram_handle || '',
        instagram_followers: currentAthleteData.instagram_followers || undefined,
        tiktok_handle: currentAthleteData.tiktok_handle || '',
        tiktok_followers: currentAthleteData.tiktok_followers || undefined,
        x_handle: currentAthleteData.x_handle || '',
        x_followers: currentAthleteData.x_followers || undefined,
        city_id: (currentAthleteData as any).city_id || undefined,
        school_id: (currentAthleteData as any).school_id || undefined,
        cultural_roots: (currentAthleteData as any).cultural_roots || []
      });
    } else {
      setAthleteProfile({
        sport: '',
        year: '',
        college: '',
        hometown: '',
        gender: '',
        photo: '',
        instagram_handle: '',
        instagram_followers: undefined,
        tiktok_handle: '',
        tiktok_followers: undefined,
        x_handle: '',
        x_followers: undefined,
        city_id: undefined,
        school_id: undefined,
        cultural_roots: []
      });
    }
    // Reset photo upload state
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setIsEditing(false);
    // Reset queries and labels to their original values before editing
    setCityQuery(originalCityQuery);
    setSchoolQuery(originalSchoolQuery);
    setSelectedCityLabel(originalSelectedCityLabel);
    setSelectedSchoolLabel(originalSelectedSchoolLabel);
  };

  const handleClearAll = () => {
    // Clear all basic information fields
    setAthleteProfile({
      sport: '',
      year: '',
      college: '',
      hometown: '',
      gender: '',
      photo: athleteProfile.photo, // Keep the photo
      instagram_handle: athleteProfile.instagram_handle, // Keep social media
      instagram_followers: athleteProfile.instagram_followers,
      tiktok_handle: athleteProfile.tiktok_handle,
      tiktok_followers: athleteProfile.tiktok_followers,
      x_handle: athleteProfile.x_handle,
      x_followers: athleteProfile.x_followers,
      city_id: undefined,
      school_id: undefined,
      cultural_roots: []
    });
    // Clear city and school queries
    setCityQuery('');
    setSchoolQuery('');
    setSelectedCityLabel('');
    setSelectedSchoolLabel('');
  };

  // Check if all required basic information fields are completed
  const isBasicInfoComplete = () => {
    return (
      athleteProfile.sport.trim() !== '' &&
      athleteProfile.year !== '' &&
      (selectedSchoolLabel.trim() !== '' || athleteProfile.college.trim() !== '') &&
      (selectedCityLabel.trim() !== '' || athleteProfile.hometown.trim() !== '') &&
      athleteProfile.gender !== ''
    );
  };

  // Check if any social media is connected
  const isAnySocialConnected = () => {
    const ig = (athleteProfile.instagram_handle || '').trim();
    const tw = (athleteProfile.x_handle || '').trim();
    const tk = (athleteProfile.tiktok_handle || '').trim();
    return ig !== '' || tw !== '' || tk !== '';
  };

  // Photo upload handlers
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB.');
        return;
      }
      
      setSelectedPhoto(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Social editing helpers
  const startSocialEdit = () => {
    setOriginalInstagramHandle(athleteProfile.instagram_handle);
    setOriginalInstagramFollowers(athleteProfile.instagram_followers);
    setOriginalTiktokHandle(athleteProfile.tiktok_handle);
    setOriginalTiktokFollowers(athleteProfile.tiktok_followers);
    setOriginalXHandle(athleteProfile.x_handle);
    setOriginalXFollowers(athleteProfile.x_followers);
    setIsEditingSocial(true);
  };

  const handleCancelSocial = () => {
    setAthleteProfile(prev => ({
      ...prev,
      instagram_handle: originalInstagramHandle,
      instagram_followers: originalInstagramFollowers,
      tiktok_handle: originalTiktokHandle,
      tiktok_followers: originalTiktokFollowers,
      x_handle: originalXHandle,
      x_followers: originalXFollowers,
    }));
    setIsEditingSocial(false);
  };

  const handleSaveSocial = async () => {
    try {
      await updateMutation.mutateAsync({
        instagram_handle: athleteProfile.instagram_handle,
        instagram_followers: athleteProfile.instagram_followers,
        tiktok_handle: athleteProfile.tiktok_handle,
        tiktok_followers: athleteProfile.tiktok_followers,
        x_handle: athleteProfile.x_handle,
        x_followers: athleteProfile.x_followers,
      });
      setIsEditingSocial(false);
    } catch (e) {
      // Errors are already logged in mutation onError
    }
  };

  const handlePhotoUploadClick = () => {
    setIsPhotoModalOpen(true);
  };

  const handleCroppedSave = (file: File, previewDataUrl: string) => {
    setSelectedPhoto(file);
    setPhotoPreview(previewDataUrl);
    setIsPhotoModalOpen(false);
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    // Do not clear the existing profile photo when cancelling a new selection.
    // We only discard the newly selected (unsaved) photo preview and input value.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Chat helpers
  const loadConversations = async () => {
    if (!profile?.id) return { data: [], total: 0 };
    const res = await ChatService.listConversationsForUser(profile.id, 'athlete', 1, 50);
    return res;
  };

  const handleOpenMessages = async () => {
    setIsChatOpen(true);
    setChatConversationId(null);
    setSelectedGroupId(null);
    setSelectedGroupTitle(null);
    setMessagesMode('direct');
    setConvLoading(true);
    try {
      if (!profile?.id) return;
      // Load direct conversations for athlete
      const res = await ChatService.listConversationsForUser(profile.id, 'athlete', 1, 50);
      setConversations(res.data || []);
      // Load unread previews to mark unread conversations
      try {
        const previews = await ChatService.getUnreadPreviewsForUser(profile.id, 'athlete');
        setUnreadConvoIds(new Set(previews.map((p) => p.conversation_id)));
      } catch {}
      // Preload groups list and their last_read_at
      try {
        setGroupsLoading(true);
        const gres = await ChatGroupService.listGroupsForUser(profile.id, 1, 50);
        setGroups(gres.data || []);
      } catch (e: any) {
        // non-fatal
      } finally {
        setGroupsLoading(false);
      }
    } catch (e: any) {
      toast({ title: 'Failed to load messages', description: e?.message || 'Please try again.' } as any);
    } finally {
      setConvLoading(false);
    }
  };

  // Show loading state while checking authentication or loading athlete data
  if (authLoading || athleteLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nil-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Loading...' : 'Loading athlete profile...'}
          </p>
        </div>
      </div>
    );
  }

  // Only redirect if auth is fully loaded and user is confirmed to not be logged in
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }
  
  // If auth is loaded but no profile yet, show loading (profile might still be fetching)
  if (!authLoading && user && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nil-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check if user is an athlete
  if (profile.role !== 'athlete') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            You need athlete privileges to access this dashboard.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-nil-orange text-white px-6 py-2 rounded-md hover:bg-nil-navy transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                aria-label="Go back to homepage"
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                  <InfoTooltip variant="desktop" />
                </div>

                <p className="text-gray-600 mt-1">
                  Manage your ÑIL Hispanic™ Athlete Profile
                </p>
              </div>
            </div>
            <Button onClick={handleOpenMessages} className="bg-nil-orange hover:bg-nil-navy flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </Button>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6 bg-white/75 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {photoPreview || athleteProfile.photo ? (
                    <img
                      src={photoPreview || athleteProfile.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nil-orange to-nil-navy">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                {/* Photo Edit Button */}
                <button
                  onClick={handlePhotoUploadClick}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-nil-orange hover:bg-nil-navy text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                  <div className="px-3 py-1 bg-nil-orange text-white text-sm rounded-full">
                    Student Athlete
                  </div>
                </div>
                {/* Email subheading (read-only) */}
                {user?.email && (
                  <div className="text-gray-600 text-sm mb-2 break-all">{user.email}</div>
                )}
                {(selectedPhoto || photoPreview) && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      size="sm"
                      className="bg-nil-orange hover:bg-nil-navy"
                    >
                      {updateMutation.isPending ? 'Saving...' : 'Save Photo'}
                    </Button>
                    <Button
                      onClick={handleRemovePhoto}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Cropper Modal */}
        <PhotoCropperModal
          open={isPhotoModalOpen}
          onOpenChange={setIsPhotoModalOpen}
          onSave={handleCroppedSave}
          initialImageUrl={athleteProfile.photo || null}
          title="Update Profile Photo"
        />

        {/* Basic Information */}
        <Card className="mb-6 bg-white/75 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-nil-orange" />
                Basic Information
              </CardTitle>
              {!isEditing ? (
                <Button
                  onClick={() => {
                    // Store original values before editing
                    setOriginalCityQuery(cityQuery);
                    setOriginalSchoolQuery(schoolQuery);
                    setOriginalSelectedCityLabel(selectedCityLabel);
                    setOriginalSelectedSchoolLabel(selectedSchoolLabel);
                    setIsEditing(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 self-start sm:self-auto"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    size="sm"
                    className="flex items-center gap-2 bg-nil-orange hover:bg-nil-navy disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleClearAll}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Warning Message for Incomplete Profile */}
            {!isBasicInfoComplete() && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    One or more fields not completed.
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Please fill in your basic info to help ÑIL Hispanic™ match you with NIL opportunities.
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sport Field */}
              <div className="space-y-2 relative">
                <Label htmlFor="sport">Sport <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <div className="relative">
                    <Input
                      id="sport"
                      value={athleteProfile.sport}
                      onChange={(e) => {
                        setAthleteProfile(prev => ({ ...prev, sport: e.target.value }));
                        setShowSportSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowSportSuggestions(athleteProfile.sport.length > 0)}
                      onBlur={() => setTimeout(() => setShowSportSuggestions(false), 200)}
                      placeholder="Enter your sport"
                      className="w-full"
                    />
                    {showSportSuggestions && athleteProfile.sport && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {getFilteredSportSuggestions(athleteProfile.sport).map((sport, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setAthleteProfile(prev => ({ ...prev, sport }));
                              setShowSportSuggestions(false);
                            }}
                          >
                            {sport}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {athleteProfile.sport || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Year Field */}
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <Select
                    value={athleteProfile.year}
                    onValueChange={(value) => setAthleteProfile(prev => ({ ...prev, year: value as 'FR' | 'SO' | 'JR' | 'SR' | 'RFR' | 'GR' | '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FR">Freshman (FR)</SelectItem>
                      <SelectItem value="SO">Sophomore (SO)</SelectItem>
                      <SelectItem value="JR">Junior (JR)</SelectItem>
                      <SelectItem value="SR">Senior (SR)</SelectItem>
                      <SelectItem value="RFR">Redshirt (RFR)</SelectItem>
                      <SelectItem value="GR">Graduate (GR)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {athleteProfile.year ? (
                      athleteProfile.year === 'FR' ? 'Freshman (FR)' :
                      athleteProfile.year === 'SO' ? 'Sophomore (SO)' :
                      athleteProfile.year === 'JR' ? 'Junior (JR)' :
                      athleteProfile.year === 'SR' ? 'Senior (SR)' :
                      athleteProfile.year === 'RFR' ? 'Redshirt (RFR)' :
                      athleteProfile.year === 'GR' ? 'Graduate (GR)' : athleteProfile.year
                    ) : 'Not specified'}
                  </div>
                )}
              </div>

              {/* College/University (Schools) Field with Autocomplete backed by schools table */}
              <div className="space-y-2 relative">
                <Label htmlFor="college">College/University <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <div className="relative">
                    <Input
                      id="college"
                      value={schoolQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchoolQuery(val);
                        setShowSchoolSuggestions(!!val);
                        // debounce
                        if (schoolSearchTimeout.current) {
                          window.clearTimeout(schoolSearchTimeout.current);
                        }
                        schoolSearchTimeout.current = window.setTimeout(async () => {
                          try {
                            const results = await CollegeService.searchSchoolsByName(val);
                            setSchoolSuggestions(results);
                          } catch (err) {
                            console.error('School search failed', err);
                          }
                        }, 200);
                      }}
                      onFocus={() => setShowSchoolSuggestions(!!schoolQuery)}
                      onBlur={() => setTimeout(() => setShowSchoolSuggestions(false), 150)}
                      placeholder="Search your college or university"
                      className="w-full"
                    />
                    {showSchoolSuggestions && schoolQuery && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
                        {schoolSuggestions.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                        ) : (
                          schoolSuggestions.map((s) => (
                            <div
                              key={s.id}
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setAthleteProfile(prev => ({ ...prev, school_id: s.id }));
                                setSelectedSchoolLabel(s.name);
                                setSchoolQuery(s.name);
                                setShowSchoolSuggestions(false);
                              }}
                            >
                              {s.name}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Select from the list to link your profile to a school.</p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {selectedSchoolLabel || athleteProfile.college || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Hometown (City) Field with Autocomplete */}
              <div className="space-y-2 relative">
                <Label htmlFor="hometown">Hometown <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <div className="relative">
                    <Input
                      id="hometown"
                      value={cityQuery}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setCityQuery(val);
                        setShowCitySuggestions(!!val);
                        // debounce
                        if (citySearchTimeout.current) {
                          window.clearTimeout(citySearchTimeout.current);
                        }
                        citySearchTimeout.current = window.setTimeout(async () => {
                          try {
                            const results = await CityService.searchCities(val);
                            setCitySuggestions(results);
                          } catch (err) {
                            console.error('City search failed', err);
                          }
                        }, 200);
                      }}
                      onFocus={() => setShowCitySuggestions(!!cityQuery)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                      placeholder="Search city (e.g., Los Angeles, CA or 90007)"
                      className="w-full"
                    />
                    {showCitySuggestions && cityQuery && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
                        {citySuggestions.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                        ) : (
                          citySuggestions.map((c) => (
                            <div
                              key={c.id}
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setAthleteProfile(prev => ({ ...prev, city_id: c.id }));
                                setCityQuery(CityService.formatCityLabel(c));
                                setSelectedCityLabel(CityService.formatCityLabel(c));
                                setShowCitySuggestions(false);
                              }}
                            >
                              {CityService.formatCityLabel(c)}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Select from the list to set your city. International cities may be unavailable.</p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {selectedCityLabel || athleteProfile.hometown || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Gender Field */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <Select
                    value={athleteProfile.gender}
                    onValueChange={(value) => setAthleteProfile(prev => ({ ...prev, gender: value as 'M' | 'F' | '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {athleteProfile.gender === 'M' ? 'Male' : 
                     athleteProfile.gender === 'F' ? 'Female' : 'Not specified'}
                  </div>
                )}
              </div>

              {/* Cultural Roots Field (Multi-select) */}
              <div className="space-y-2">
                <Label htmlFor="cultural_roots">Cultural Roots</Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <span className="truncate text-left">
                          {athleteProfile.cultural_roots && athleteProfile.cultural_roots.length > 0
                            ? `${athleteProfile.cultural_roots.length} selected`
                            : 'Select cultural roots'}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0">
                      <div className="max-h-60 overflow-y-auto py-1">
                        {CULTURAL_ROOT_OPTIONS.map((opt) => {
                          const id = `root-${opt.replace(/\s+/g, '-').toLowerCase()}`;
                          const checked = !!(athleteProfile.cultural_roots || []).includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setAthleteProfile(prev => {
                                  const curr = prev.cultural_roots || [];
                                  const exists = curr.includes(opt);
                                  return {
                                    ...prev,
                                    cultural_roots: exists
                                      ? curr.filter(r => r !== opt)
                                      : [...curr, opt]
                                  };
                                });
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground ${checked ? 'bg-accent/50' : ''}`}
                            >
                              <Checkbox
                                id={id}
                                checked={checked}
                                onCheckedChange={() => { /* handled by button onClick */ }}
                                className="pointer-events-none"
                              />
                              <label htmlFor={id} className="leading-none cursor-pointer select-none flex-1">
                                {opt}
                              </label>
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {athleteProfile.cultural_roots && athleteProfile.cultural_roots.length > 0
                      ? athleteProfile.cultural_roots.join(', ')
                      : 'Not specified'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Section */}
        <Card className="bg-white/75 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-nil-orange" />
                  Social Media Presence
                </CardTitle>
              </div>
              {!isEditingSocial ? (
                <Button
                  onClick={startSocialEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 self-start sm:self-auto"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleSaveSocial}
                    disabled={updateMutation.isPending}
                    size="sm"
                    className="flex items-center gap-2 bg-nil-orange hover:bg-nil-navy disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancelSocial}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Warning Message for No Social Media Connected */}
            {!isAnySocialConnected() && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    No social media connected.
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    ÑIL Hispanic recommends connecting at least one social media account.
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-8">
              {/* Instagram */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Instagram</h4>
                    <p className="text-sm text-gray-500">
                      {athleteProfile.instagram_handle ? (
                        <>
                          @{athleteProfile.instagram_handle.replace(/^@+/, '')}
                          {athleteProfile.instagram_followers && (
                            <span className="ml-2">• {athleteProfile.instagram_followers.toLocaleString()} followers</span>
                          )}
                        </>
                      ) : (
                        'Not connected'
                      )}
                    </p>
                  </div>
                </div>
                {isEditingSocial && (
                  <div className="flex gap-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                      <Input
                        value={athleteProfile.instagram_handle || ''}
                        onChange={(e) => {
                          // Strip leading @ and any disallowed characters
                          const raw = e.target.value;
                          const cleaned = raw.replace(/^@+/, '').replace(/[^a-zA-Z0-9._-]/g, '');
                          setAthleteProfile(prev => ({
                            ...prev,
                            instagram_handle: cleaned,
                            instagram_followers: cleaned ? prev.instagram_followers : undefined
                          }));
                        }}
                        placeholder="username"
                        className="w-32 pl-6"
                        inputMode="text"
                      />
                    </div>
                    <Input
                      type="number"
                      value={athleteProfile.instagram_followers ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setAthleteProfile(prev => ({ ...prev, instagram_followers: undefined }));
                        } else {
                          const numValue = parseInt(value, 10);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setAthleteProfile(prev => ({ ...prev, instagram_followers: numValue }));
                          }
                        }
                      }}
                      placeholder="Followers"
                      className="w-24"
                      disabled={!athleteProfile.instagram_handle}
                    />
                  </div>
                )}
              </div>
              {/* X (Twitter) - temporarily disabled
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">X (Twitter)</h4>
                    <p className="text-sm text-gray-500">
                      {athleteProfile.x_handle ? (
                        <>
                          @{athleteProfile.x_handle.replace(/^@+/, '')}
                          {athleteProfile.x_followers && (
                            <span className="ml-2">• {athleteProfile.x_followers.toLocaleString()} followers</span>
                          )}
                        </>
                      ) : (
                        'Not connected'
                      )}
                    </p>
                  </div>
                </div>
                {isEditingSocial && (
                  <div className="flex gap-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                      <Input
                        value={athleteProfile.x_handle || ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const cleaned = raw.replace(/^@+/, '').replace(/[^a-zA-Z0-9._-]/g, '');
                          setAthleteProfile(prev => ({
                            ...prev,
                            x_handle: cleaned,
                            x_followers: cleaned ? prev.x_followers : undefined
                          }));
                        }}
                        placeholder="username"
                        className="w-32 pl-6"
                        inputMode="text"
                      />
                    </div>
                    <Input
                      type="number"
                      value={athleteProfile.x_followers ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setAthleteProfile(prev => ({ ...prev, x_followers: undefined }));
                        } else {
                          const numValue = parseInt(value, 10);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setAthleteProfile(prev => ({ ...prev, x_followers: numValue }));
                          }
                        }
                      }}
                      placeholder="Followers"
                      className="w-24"
                      disabled={!athleteProfile.x_handle}
                    />
                  </div>
                )}
              </div>
              */}

              {/* TikTok - temporarily disabled
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-black rounded-lg flex items-center justify-center">
                    <TikTokIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">TikTok</h4>
                    <p className="text-sm text-gray-500">
                      {athleteProfile.tiktok_handle ? (
                        <>
                          @{athleteProfile.tiktok_handle.replace(/^@+/, '')}
                          {athleteProfile.tiktok_followers && (
                            <span className="ml-2">• {athleteProfile.tiktok_followers.toLocaleString()} followers</span>
                          )}
                        </>
                      ) : (
                        'Not connected'
                      )}
                    </p>
                  </div>
                </div>
                {isEditingSocial && (
                  <div className="flex gap-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                      <Input
                        value={athleteProfile.tiktok_handle || ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const cleaned = raw.replace(/^@+/, '').replace(/[^a-zA-Z0-9._-]/g, '');
                          setAthleteProfile(prev => ({
                            ...prev,
                            tiktok_handle: cleaned,
                            tiktok_followers: cleaned ? prev.tiktok_followers : undefined
                          }));
                        }}
                        placeholder="username"
                        className="w-32 pl-6"
                        inputMode="text"
                      />
                    </div>
                    <Input
                      type="number"
                      value={athleteProfile.tiktok_followers ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setAthleteProfile(prev => ({ ...prev, tiktok_followers: undefined }));
                        } else {
                          const numValue = parseInt(value, 10);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setAthleteProfile(prev => ({ ...prev, tiktok_followers: numValue }));
                          }
                        }
                      }}
                      placeholder="Followers"
                      className="w-24"
                      disabled={!athleteProfile.tiktok_handle}
                    />
                  </div>
                )}
              </div>
              */}
            </div>
          </CardContent>
        </Card>

        {/* Chat Modal */}
        <Dialog open={isChatOpen} onOpenChange={(open) => {
          setIsChatOpen(open);
          if (!open) {
            setChatConversationId(null);
            setSelectedGroupId(null);
            setSelectedGroupTitle(null);
          }
        }}>
          <DialogContent className="max-w-3xl w-full">
            <DialogHeader>
              <DialogTitle>
                {chatConversationId
                  ? 'Conversation'
                  : selectedGroupId
                    ? `Group: ${selectedGroupTitle || 'Group'}`
                    : 'Your Messages'}
              </DialogTitle>
            </DialogHeader>
            {/* If a conversation is selected, show chat window */}
            {chatConversationId && profile ? (
              <ChatWindow
                conversationId={chatConversationId}
                currentUserId={profile.id}
                title="Admin"
                onBack={() => setChatConversationId(null)}
              />
            ) : selectedGroupId && profile ? (
              <GroupChatWindow
                groupId={selectedGroupId}
                currentUserId={profile.id}
                title={selectedGroupTitle || 'Group'}
                onTitleChange={(newTitle) => setSelectedGroupTitle(newTitle)}
                onBack={() => {
                  setSelectedGroupId(null);
                  setSelectedGroupTitle(null);
                }}
              />
            ) : (
              <div className="space-y-4">
                {/* Toggle */}
                <div className="inline-flex rounded-md border overflow-hidden">
                  <button
                    className={`px-3 py-1.5 text-sm ${messagesMode === 'direct' ? 'bg-nil-orange text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setMessagesMode('direct')}
                  >
                    Direct
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm border-l ${messagesMode === 'groups' ? 'bg-nil-orange text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={async () => {
                      setMessagesMode('groups');
                      if (profile?.id && groups.length === 0) {
                        try {
                          setGroupsLoading(true);
                          const gres = await ChatGroupService.listGroupsForUser(profile.id, 1, 50);
                          setGroups(gres.data || []);
                          const groupIds = (gres.data || []).map((g) => g.id);
                          if (groupIds.length > 0) {
                            const { data: parts } = await supabase
                              .from('group_participants')
                              .select('group_id, last_read_at')
                              .eq('user_id', profile.id)
                              .in('group_id', groupIds);
                            const map: Record<string, string | null> = {};
                            for (const row of (parts as any[]) || []) map[String((row as any).group_id)] = (row as any).last_read_at || null;
                            setGroupLastReadMap(map);
                          }
                        } catch {} finally { setGroupsLoading(false); }
                      }
                    }}
                  >
                    Groups
                  </button>
                </div>

                {messagesMode === 'direct' ? (
                  <div className="space-y-3">
                    {convLoading ? (
                      <div className="py-6 text-center text-gray-500">Loading conversations...</div>
                    ) : conversations.length === 0 ? (
                      <div className="py-6 text-center text-gray-500">No conversations yet.</div>
                    ) : (
                      <div className="max-h-[50vh] overflow-y-auto">
                        <div className="divide-y rounded-md border">
                          {conversations
                            .filter((c) => {
                              // Athlete sees only admin counterpart; we don't have name enrichment here, so use a placeholder label and allow all unless searching for 'admin'
                              const label = 'admin';
                              return directSearch.trim() === '' || label.includes(directSearch.toLowerCase());
                            })
                            .map((c) => (
                            <button
                              key={c.id}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none"
                              onClick={async () => {
                                setChatConversationId(c.id);
                                if (profile?.id) {
                                  try { await ChatService.markConversationRead(c.id, profile.id); } catch {}
                                  setUnreadConvoIds((prev) => {
                                    const next = new Set(prev);
                                    next.delete(c.id);
                                    return next;
                                  });
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  {unreadConvoIds.has(c.id) ? (
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0" aria-label="Unread messages" title="Unread messages" />
                                  ) : null}
                                  <div className="font-medium truncate">Chat with Admin</div>
                                </div>
                                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                  <div className="text-xs text-gray-500">
                                    {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : '—'}
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1 rounded hover:bg-gray-100 focus:outline-none"
                                        aria-label="Conversation options"
                                      >
                                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setUnreadConvoIds((prev) => {
                                            const next = new Set(prev);
                                            next.add(c.id);
                                            return next;
                                          });
                                        }}
                                      >
                                        Mark as Unread
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">Conversation ID: {c.id}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto">
                    <GroupChatList
                      groups={groups.filter((g) => {
                        const title = String(g.title || 'Group').toLowerCase();
                        return groupSearch.trim() === '' || title.includes(groupSearch.toLowerCase());
                      })}
                      lastReadMap={groupLastReadMap}
                      loading={groupsLoading}
                      onOpen={async (g) => {
                        setSelectedGroupId(g.id);
                        setSelectedGroupTitle(g.title);
                        if (profile?.id) {
                          try { await ChatGroupService.markGroupRead(g.id, profile.id); } catch {}
                          // Optimistically bump last read
                          setGroupLastReadMap((prev) => ({ ...prev, [g.id]: new Date().toISOString() }));
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AthleteDashboard;
