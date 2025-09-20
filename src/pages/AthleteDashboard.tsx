import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { User, Trophy, Calendar, MessageSquare, Settings, BarChart3, Edit3, Save, X, ArrowLeft, Camera, Upload, Instagram, Twitter } from 'lucide-react';
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
    school_id: undefined
  });
  
  // Photo upload state
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    mutationFn: async (updates: Partial<Pick<AthleteProfile, 'sport' | 'year' | 'college' | 'hometown' | 'gender' | 'photo' | 'instagram_handle' | 'instagram_followers' | 'tiktok_handle' | 'tiktok_followers' | 'x_handle' | 'x_followers' | 'city_id' | 'school_id'>>) => {
      if (!profile?.id) throw new Error('No profile ID available');
      
      // Handle photo upload if there's a selected photo
      let photoUrl = updates.photo;
      if (selectedPhoto) {
        console.log('Uploading photo...');
        photoUrl = await photoUploadMutation.mutateAsync(selectedPhoto);
        console.log('Photo uploaded successfully:', photoUrl);
      }
      
      // Explicitly include ids as number or null to avoid being dropped
      const finalUpdates = {
        ...updates,
        photo: photoUrl,
        city_id: typeof athleteProfile.city_id === 'number' ? athleteProfile.city_id : null,
        school_id: typeof athleteProfile.school_id === 'number' ? athleteProfile.school_id : null
      } as typeof updates;
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
      school_id: (currentAthleteData as any).school_id || undefined
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
        school_id: (currentAthleteData as any).school_id || undefined
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
        school_id: undefined
      });
    }
    // Reset photo upload state
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setIsEditing(false);
    // Reset query to either selected city label or hometown
    setCityQuery(selectedCityLabel || currentAthleteData?.hometown || '');
    // Reset school query to selected label or existing college text
    setSchoolQuery(selectedSchoolLabel || currentAthleteData?.college || '');
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

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setAthleteProfile(prev => ({ ...prev, photo: '' }));
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
      const res: any = await loadConversations();
      setConversations(res.data || []);
      if ((res.total || 0) === 0) {
        toast({ title: 'No messages yet', description: 'You will see messages here when an admin contacts you.' } as any);
      } else if ((res.total || 0) === 1) {
        setChatConversationId(res.data[0].id);
      } else {
        setChatConversationId(null);
      }
      // Load groups in background
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
    <div className="min-h-screen bg-gray-50">
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
                  Manage your athlete profile and social media presence
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
        <Card className="mb-6">
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
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  {athleteProfile.sport && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>{athleteProfile.sport}</span>
                    </div>
                  )}
                  {(selectedSchoolLabel || athleteProfile.college) && (
                    <div className="flex items-center gap-1">
                      <Settings className="w-4 h-4" />
                      <span>{selectedSchoolLabel || athleteProfile.college}</span>
                    </div>
                  )}
                  {athleteProfile.year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {athleteProfile.year === 'FR' ? 'Freshman' :
                         athleteProfile.year === 'SO' ? 'Sophomore' :
                         athleteProfile.year === 'JR' ? 'Junior' :
                         athleteProfile.year === 'SR' ? 'Senior' :
                         athleteProfile.year === 'RFR' ? 'Redshirt' :
                         athleteProfile.year === 'GR' ? 'Graduate' : athleteProfile.year}
                      </span>
                    </div>
                  )}
                </div>
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

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-nil-orange" />
                Basic Information
              </CardTitle>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sport Field */}
              <div className="space-y-2 relative">
                <Label htmlFor="sport">Sport</Label>
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
                <Label htmlFor="year">Academic Year</Label>
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
                <Label htmlFor="college">College/University</Label>
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
                <Label htmlFor="hometown">Hometown</Label>
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
                <Label htmlFor="gender">Gender</Label>
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
            </div>
          </CardContent>
        </Card>

        {/* Social Media Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-nil-orange" />
              Social Media Presence
            </CardTitle>
            <CardDescription>
              Connect your social media accounts to showcase your online presence
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          {athleteProfile.instagram_handle}
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
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      value={athleteProfile.instagram_handle || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAthleteProfile(prev => ({
                          ...prev,
                          instagram_handle: value,
                          instagram_followers: value ? prev.instagram_followers : undefined
                        }));
                      }}
                      placeholder="@username"
                      className="w-32"
                    />
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
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* X (Twitter) */}
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
                          {athleteProfile.x_handle}
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
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      value={athleteProfile.x_handle || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAthleteProfile(prev => ({
                          ...prev,
                          x_handle: value,
                          x_followers: value ? prev.x_followers : undefined
                        }));
                      }}
                      placeholder="@username"
                      className="w-32"
                    />
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
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* TikTok */}
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
                          {athleteProfile.tiktok_handle}
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
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      value={athleteProfile.tiktok_handle || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAthleteProfile(prev => ({
                          ...prev,
                          tiktok_handle: value,
                          tiktok_followers: value ? prev.tiktok_followers : undefined
                        }));
                      }}
                      placeholder="@username"
                      className="w-32"
                    />
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
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </div>
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
                      <div className="divide-y rounded-md border">
                        {conversations.map((c) => (
                          <button
                            key={c.id}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none"
                            onClick={() => setChatConversationId(c.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium">Chat with Admin</div>
                              <div className="text-xs text-gray-500">
                                {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : '—'}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">Conversation ID: {c.id}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <GroupChatList
                    groups={groups}
                    loading={groupsLoading}
                    onOpen={async (g) => {
                      setSelectedGroupId(g.id);
                      setSelectedGroupTitle(g.title);
                      if (profile?.id) {
                        try { await ChatGroupService.markGroupRead(g.id, profile.id); } catch {}
                      }
                    }}
                  />
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
