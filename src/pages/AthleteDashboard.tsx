import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { User, Trophy, Calendar, MessageSquare, Settings, BarChart3, Edit3, Save, X, ArrowLeft, Camera, Upload } from 'lucide-react';
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
import { ChatService } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';
import type { Conversation } from '@/types/chat';

interface AthleteProfile {
  sport: string;
  year: 'FR' | 'SO' | 'JR' | 'SR' | '';
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
    x_followers: undefined
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
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  
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
    mutationFn: async (updates: Partial<Pick<AthleteProfile, 'sport' | 'year' | 'college' | 'hometown' | 'gender' | 'photo' | 'instagram_handle' | 'instagram_followers' | 'tiktok_handle' | 'tiktok_followers' | 'x_handle' | 'x_followers'>>) => {
      if (!profile?.id) throw new Error('No profile ID available');
      
      // Handle photo upload if there's a selected photo
      let photoUrl = updates.photo;
      if (selectedPhoto) {
        console.log('Uploading photo...');
        photoUrl = await photoUploadMutation.mutateAsync(selectedPhoto);
        console.log('Photo uploaded successfully:', photoUrl);
      }
      
      const finalUpdates = { ...updates, photo: photoUrl };
      
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
    if (currentAthleteData) {
      setAthleteProfile({
        sport: currentAthleteData.sport || '',
        year: (currentAthleteData.year as 'FR' | 'SO' | 'JR' | 'SR') || '',
        college: currentAthleteData.college || '',
        hometown: currentAthleteData.hometown || '',
        gender: (currentAthleteData.gender as 'M' | 'F') || '',
        photo: currentAthleteData.photo || '',
        instagram_handle: currentAthleteData.instagram_handle || '',
        instagram_followers: currentAthleteData.instagram_followers || undefined,
        tiktok_handle: currentAthleteData.tiktok_handle || '',
        tiktok_followers: currentAthleteData.tiktok_followers || undefined,
        x_handle: currentAthleteData.x_handle || '',
        x_followers: currentAthleteData.x_followers || undefined
      });
    }
  }, [currentAthleteData]);
  
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
        year: (currentAthleteData.year as 'FR' | 'SO' | 'JR' | 'SR') || '',
        college: currentAthleteData.college || '',
        hometown: currentAthleteData.hometown || '',
        gender: (currentAthleteData.gender as 'M' | 'F') || '',
        photo: currentAthleteData.photo || '',
        instagram_handle: currentAthleteData.instagram_handle || '',
        instagram_followers: currentAthleteData.instagram_followers || undefined,
        tiktok_handle: currentAthleteData.tiktok_handle || '',
        tiktok_followers: currentAthleteData.tiktok_followers || undefined,
        x_handle: currentAthleteData.x_handle || '',
        x_followers: currentAthleteData.x_followers || undefined
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
        x_followers: undefined
      });
    }
    // Reset photo upload state
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setIsEditing(false);
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
                <h1 className="text-3xl font-bold text-gray-900">Athlete Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  Welcome back, {profile.full_name || 'Athlete'}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <User className="w-5 h-5 text-nil-orange" />
              <div>
                <div className="font-medium text-sm">{profile.full_name}</div>
                <div className="text-xs text-gray-500 capitalize">{profile.role}</div>
              </div>
            </div>
            <Button onClick={handleOpenMessages} className="ml-3 bg-nil-orange hover:bg-nil-navy flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </Button>
          </div>
        </div>

        {/* Profile Information Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-nil-orange" />
                  Athlete Profile
                </CardTitle>
                <CardDescription>
                  Manage your athletic profile information
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
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
            {/* Photo Upload Section */}
            <div className="mb-6">
              <Label htmlFor="photo">Profile Photo</Label>
              <div className="mt-2 flex items-center gap-4">
                {/* Photo Preview */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                    {photoPreview || athleteProfile.photo ? (
                      <img
                        src={photoPreview || athleteProfile.photo}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Upload Controls */}
                {isEditing && (
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={handlePhotoUploadClick}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {photoPreview || athleteProfile.photo ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {(photoPreview || athleteProfile.photo) && (
                      <Button
                        type="button"
                        onClick={handleRemovePhoto}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                        Remove Photo
                      </Button>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Max file size: 5MB. Supported formats: JPG, JPEG, PNG
                    </p>
                  </div>
                )}
                
                {!isEditing && !athleteProfile.photo && (
                  <div className="text-sm text-gray-500">
                    No photo uploaded
                  </div>
                )}
              </div>
            </div>
            
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
                    onValueChange={(value) => setAthleteProfile(prev => ({ ...prev, year: value as 'FR' | 'SO' | 'JR' | 'SR' | '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FR">Freshman (FR)</SelectItem>
                      <SelectItem value="SO">Sophomore (SO)</SelectItem>
                      <SelectItem value="JR">Junior (JR)</SelectItem>
                      <SelectItem value="SR">Senior (SR)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {athleteProfile.year ? (
                      athleteProfile.year === 'FR' ? 'Freshman (FR)' :
                      athleteProfile.year === 'SO' ? 'Sophomore (SO)' :
                      athleteProfile.year === 'JR' ? 'Junior (JR)' :
                      athleteProfile.year === 'SR' ? 'Senior (SR)' : athleteProfile.year
                    ) : 'Not specified'}
                  </div>
                )}
              </div>

              {/* College Field */}
              <div className="space-y-2 relative">
                <Label htmlFor="college">College/University</Label>
                {isEditing ? (
                  <div className="relative">
                    <Input
                      id="college"
                      value={athleteProfile.college}
                      onChange={(e) => {
                        setAthleteProfile(prev => ({ ...prev, college: e.target.value }));
                        setShowCollegeSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowCollegeSuggestions(athleteProfile.college.length > 0)}
                      onBlur={() => setTimeout(() => setShowCollegeSuggestions(false), 200)}
                      placeholder="Enter your college or university"
                      className="w-full"
                    />
                    {showCollegeSuggestions && athleteProfile.college && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {getFilteredCollegeSuggestions(athleteProfile.college).map((college, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setAthleteProfile(prev => ({ ...prev, college }));
                              setShowCollegeSuggestions(false);
                            }}
                          >
                            {college}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {athleteProfile.college || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Hometown Field */}
              <div className="space-y-2">
                <Label htmlFor="hometown">Hometown</Label>
                {isEditing ? (
                  <Input
                    id="hometown"
                    value={athleteProfile.hometown}
                    onChange={(e) => setAthleteProfile(prev => ({ ...prev, hometown: e.target.value }))}
                    placeholder="Enter your hometown"
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {athleteProfile.hometown || 'Not specified'}
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
              Social Media
            </CardTitle>
            <CardDescription>
              Connect your social media accounts to showcase your online presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instagram Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-700">Instagram</h4>
                
                {/* Instagram Handle */}
                <div className="space-y-2">
                  <Label htmlFor="instagram_handle">Instagram Handle</Label>
                  {isEditing ? (
                    <Input
                      id="instagram_handle"
                      value={athleteProfile.instagram_handle || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAthleteProfile(prev => ({ 
                          ...prev, 
                          instagram_handle: value,
                          // Clear followers if handle is removed
                          instagram_followers: value ? prev.instagram_followers : undefined
                        }));
                      }}
                      placeholder="@username"
                      className="w-full"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {athleteProfile.instagram_handle || 'Not specified'}
                    </div>
                  )}
                </div>

                {/* Instagram Followers */}
                <div className="space-y-2">
                  <Label htmlFor="instagram_followers">Instagram Followers</Label>
                  {isEditing ? (
                    <Input
                      id="instagram_followers"
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
                      placeholder="Follower count"
                      className="w-full"
                      disabled={!athleteProfile.instagram_handle}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {athleteProfile.instagram_followers ? athleteProfile.instagram_followers.toLocaleString() : 'Not specified'}
                    </div>
                  )}
                </div>
              </div>

              {/* X (Twitter) Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-700">X (Twitter)</h4>
                
                {/* X Handle */}
                <div className="space-y-2">
                  <Label htmlFor="x_handle">X Handle</Label>
                  {isEditing ? (
                    <Input
                      id="x_handle"
                      value={athleteProfile.x_handle || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAthleteProfile(prev => ({ 
                          ...prev, 
                          x_handle: value,
                          // Clear followers if handle is removed
                          x_followers: value ? prev.x_followers : undefined
                        }));
                      }}
                      placeholder="@username"
                      className="w-full"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {athleteProfile.x_handle || 'Not specified'}
                    </div>
                  )}
                </div>

                {/* X Followers */}
                <div className="space-y-2">
                  <Label htmlFor="x_followers">X Followers</Label>
                  {isEditing ? (
                    <Input
                      id="x_followers"
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
                      placeholder="Follower count"
                      className="w-full"
                      disabled={!athleteProfile.x_handle}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {athleteProfile.x_followers ? athleteProfile.x_followers.toLocaleString() : 'Not specified'}
                    </div>
                  )}
                </div>
              </div>

              {/* TikTok Section */}
              <div className="space-y-4 md:col-span-2">
                <h4 className="font-medium text-sm text-gray-700">TikTok</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TikTok Handle */}
                  <div className="space-y-2">
                    <Label htmlFor="tiktok_handle">TikTok Handle</Label>
                    {isEditing ? (
                      <Input
                        id="tiktok_handle"
                        value={athleteProfile.tiktok_handle || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAthleteProfile(prev => ({ 
                            ...prev, 
                            tiktok_handle: value,
                            // Clear followers if handle is removed
                            tiktok_followers: value ? prev.tiktok_followers : undefined
                          }));
                        }}
                        placeholder="@username"
                        className="w-full"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">
                        {athleteProfile.tiktok_handle || 'Not specified'}
                      </div>
                    )}
                  </div>

                  {/* TikTok Followers */}
                  <div className="space-y-2">
                    <Label htmlFor="tiktok_followers">TikTok Followers</Label>
                    {isEditing ? (
                      <Input
                        id="tiktok_followers"
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
                        placeholder="Follower count"
                        className="w-full"
                        disabled={!athleteProfile.tiktok_handle}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">
                        {athleteProfile.tiktok_followers ? athleteProfile.tiktok_followers.toLocaleString() : 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-nil-orange" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Connect with brands and opportunities.</p>
              <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Chat Modal */}
        <Dialog open={isChatOpen} onOpenChange={(open) => {
          setIsChatOpen(open);
          if (!open) {
            setChatConversationId(null);
          }
        }}>
          <DialogContent className="max-w-3xl w-full">
            <DialogHeader>
              <DialogTitle>
                {chatConversationId ? 'Conversation' : 'Your Messages'}
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
            ) : (
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
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AthleteDashboard;
