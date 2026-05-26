import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, User, Edit3, Save, X, Trash2, AlertTriangle, Instagram, ChevronDown, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { CityService, type City } from '@/services/cityService';
import { useStudentAthletes } from '@/hooks/useStudentAthletes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

const CULTURAL_ROOT_OPTIONS = [
  'Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Dominican Republic', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras',
  'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Puerto Rico',
  'Spain', 'Uruguay', 'Venezuela', 'Other',
];

interface HSProfile {
  sport: string;
  grade: 9 | 10 | 11 | 12 | undefined;
  age: number | undefined;
  city_id: number | undefined;
  hometown: string;
  cultural_roots: string[];
  instagram_handle: string;
}

const HighSchoolAthleteDashboard: React.FC = () => {
  const { profile, loading: authLoading, user } = useAuth();
  const { uniqueSports } = useStudentAthletes();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [hsProfile, setHsProfile] = useState<HSProfile>({
    sport: '',
    grade: undefined,
    age: undefined,
    city_id: undefined,
    hometown: '',
    cultural_roots: [],
    instagram_handle: '',
  });

  // Social media edit state
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [originalInstagramHandle, setOriginalInstagramHandle] = useState('');

  // Sport autocomplete state
  const [sportSuggestions, setSportSuggestions] = useState<string[]>([]);
  const [showSportSuggestions, setShowSportSuggestions] = useState(false);

  // City autocomplete state
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const citySearchTimeout = useRef<number | null>(null);
  const [selectedCityLabel, setSelectedCityLabel] = useState<string>('');

  // Original values for cancel
  const [originalCityQuery, setOriginalCityQuery] = useState<string>('');
  const [originalSelectedCityLabel, setOriginalSelectedCityLabel] = useState<string>('');

  const { data: currentData, isLoading: dataLoading } = useQuery({
    queryKey: ['hs-athlete-profile', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data, error } = await supabase
        .from('high_school_athletes')
        .select('*')
        .eq('profile_id', profile.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!profile?.id && profile?.role === 'high_school_athlete',
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (uniqueSports) setSportSuggestions(uniqueSports);
  }, [uniqueSports]);

  const getFilteredSportSuggestions = (input: string) =>
    sportSuggestions
      .filter(sport => sport && sport.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 5);

  const updateMutation = useMutation({
    mutationFn: async (updates: HSProfile) => {
      if (!profile?.id) throw new Error('No profile ID available');
      const payload = {
        sport: updates.sport || null,
        grade: typeof updates.grade === 'number' ? updates.grade : null,
        age: typeof updates.age === 'number' ? updates.age : null,
        city_id: typeof updates.city_id === 'number' ? updates.city_id : null,
        hometown: updates.hometown || null,
        cultural_roots: updates.cultural_roots?.length ? updates.cultural_roots : null,
        instagram_handle: updates.instagram_handle || null,
      };
      if (!currentData) {
        const { error } = await supabase
          .from('high_school_athletes')
          .insert({ profile_id: profile.id, name: profile.full_name || 'Unknown', ...payload });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('high_school_athletes')
          .update(payload)
          .eq('profile_id', profile.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hs-athlete-profile', profile?.id] });
      setIsEditing(false);
    },
  });

  const updateSocialMutation = useMutation({
    mutationFn: async (instagram_handle: string) => {
      if (!profile?.id) throw new Error('No profile ID available');
      const { error } = await supabase
        .from('high_school_athletes')
        .update({ instagram_handle: instagram_handle || null })
        .eq('profile_id', profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hs-athlete-profile', profile?.id] });
      setIsEditingSocial(false);
    },
  });

  useEffect(() => {
    if (!currentData) return;
    setHsProfile({
      sport: currentData.sport || '',
      grade: ([9, 10, 11, 12].includes(currentData.grade) ? currentData.grade : undefined) as 9 | 10 | 11 | 12 | undefined,
      age: currentData.age ?? undefined,
      city_id: currentData.city_id ?? undefined,
      hometown: currentData.hometown || '',
      cultural_roots: currentData.cultural_roots || [],
      instagram_handle: currentData.instagram_handle || '',
    });

    const loadCityData = async () => {
      const cid = currentData.city_id as number | undefined;
      if (cid) {
        try {
          const city = await CityService.getCityById(cid);
          if (city) {
            const label = CityService.formatCityLabel(city);
            setSelectedCityLabel(label);
            setCityQuery(label);
          } else {
            setSelectedCityLabel('');
            setCityQuery(currentData.hometown || '');
          }
        } catch {
          setSelectedCityLabel('');
          setCityQuery(currentData.hometown || '');
        }
      } else {
        setSelectedCityLabel('');
        setCityQuery(currentData.hometown || '');
      }
    };
    loadCityData();
  }, [currentData?.id]);

  const handleSave = () => {
    updateMutation.mutate(hsProfile);
  };

  const handleCancel = () => {
    if (currentData) {
      setHsProfile({
        sport: currentData.sport || '',
        grade: ([9, 10, 11, 12].includes(currentData.grade) ? currentData.grade : undefined) as 9 | 10 | 11 | 12 | undefined,
        age: currentData.age ?? undefined,
        city_id: currentData.city_id ?? undefined,
        hometown: currentData.hometown || '',
        cultural_roots: currentData.cultural_roots || [],
        instagram_handle: currentData.instagram_handle || '',
      });
    } else {
      setHsProfile({ sport: '', grade: undefined, age: undefined, city_id: undefined, hometown: '', cultural_roots: [], instagram_handle: '' });
    }
    setIsEditing(false);
    setCityQuery(originalCityQuery);
    setSelectedCityLabel(originalSelectedCityLabel);
  };

  const handleClearAll = () => {
    setHsProfile({ sport: '', grade: undefined, age: undefined, city_id: undefined, hometown: '', cultural_roots: [], instagram_handle: hsProfile.instagram_handle });
    setCityQuery('');
    setSelectedCityLabel('');
  };

  const startSocialEdit = () => {
    setOriginalInstagramHandle(hsProfile.instagram_handle);
    setIsEditingSocial(true);
  };

  const handleSaveSocial = () => {
    updateSocialMutation.mutate(hsProfile.instagram_handle);
  };

  const handleCancelSocial = () => {
    setHsProfile(prev => ({ ...prev, instagram_handle: originalInstagramHandle }));
    setIsEditingSocial(false);
  };

  const isProfileComplete = () =>
    hsProfile.sport.trim() !== '' &&
    hsProfile.grade !== undefined &&
    typeof hsProfile.age === 'number' &&
    (selectedCityLabel.trim() !== '' || hsProfile.hometown.trim() !== '');

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nil-orange mx-auto" />
          <p className="mt-4 text-gray-600">{authLoading ? 'Loading...' : 'Loading profile...'}</p>
        </div>
      </div>
    );
  }

  if (!authLoading && !user) return <Navigate to="/" replace />;

  if (!authLoading && user && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nil-orange mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profile.role !== 'high_school_athlete') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            You need high school athlete privileges to access this dashboard.
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
          <div className="flex items-center gap-4">
            <Link
              to="/"
              aria-label="Go back to homepage"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your ÑIL Hispanic™ High School Athlete Profile
              </p>
            </div>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6 bg-white/75 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-nil-orange to-nil-navy">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                  <div className="px-3 py-1 bg-nil-orange text-white text-sm rounded-full">
                    High School Athlete
                  </div>
                </div>
                {user?.email && (
                  <div className="text-gray-600 text-sm break-all">{user.email}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information Card */}
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
                    setOriginalCityQuery(cityQuery);
                    setOriginalSelectedCityLabel(selectedCityLabel);
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
            {!isProfileComplete() && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    One or more fields not completed.
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Please fill in your basic info to help ÑIL Hispanic™ match you with opportunities.
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
                      value={hsProfile.sport}
                      onChange={(e) => {
                        setHsProfile(prev => ({ ...prev, sport: e.target.value }));
                        setShowSportSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowSportSuggestions(hsProfile.sport.length > 0)}
                      onBlur={() => setTimeout(() => setShowSportSuggestions(false), 200)}
                      placeholder="Enter your sport"
                      className="w-full"
                    />
                    {showSportSuggestions && hsProfile.sport && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {getFilteredSportSuggestions(hsProfile.sport).map((sport, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setHsProfile(prev => ({ ...prev, sport }));
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
                    {hsProfile.sport || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Year/Grade Field */}
              <div className="space-y-2">
                <Label htmlFor="grade">Year/Grade <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <Select
                    value={hsProfile.grade !== undefined ? String(hsProfile.grade) : ''}
                    onValueChange={(value) =>
                      setHsProfile(prev => ({ ...prev, grade: parseInt(value, 10) as 9 | 10 | 11 | 12 }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9th Grade (Freshman)</SelectItem>
                      <SelectItem value="10">10th Grade (Sophomore)</SelectItem>
                      <SelectItem value="11">11th Grade (Junior)</SelectItem>
                      <SelectItem value="12">12th Grade (Senior)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {hsProfile.grade === 9 ? '9th Grade (Freshman)' :
                     hsProfile.grade === 10 ? '10th Grade (Sophomore)' :
                     hsProfile.grade === 11 ? '11th Grade (Junior)' :
                     hsProfile.grade === 12 ? '12th Grade (Senior)' : 'Not specified'}
                  </div>
                )}
              </div>

              {/* Age Field */}
              <div className="space-y-2">
                <Label htmlFor="age">Age <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <Input
                    id="age"
                    type="number"
                    min={1}
                    max={99}
                    value={hsProfile.age ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setHsProfile(prev => ({ ...prev, age: undefined }));
                      } else {
                        const n = parseInt(val, 10);
                        if (!isNaN(n) && n > 0) {
                          setHsProfile(prev => ({ ...prev, age: n }));
                        }
                      }
                    }}
                    placeholder="Enter your age"
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {hsProfile.age ?? 'Not specified'}
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
                                setHsProfile(prev => ({ ...prev, city_id: c.id }));
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
                    <p className="text-xs text-gray-500 mt-1">
                      Select from the list to set your city. International cities may be unavailable.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {selectedCityLabel || hsProfile.hometown || 'Not specified'}
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
                          {hsProfile.cultural_roots && hsProfile.cultural_roots.length > 0
                            ? `${hsProfile.cultural_roots.length} selected`
                            : 'Select cultural roots'}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0">
                      <div className="max-h-60 overflow-y-auto py-1">
                        {CULTURAL_ROOT_OPTIONS.map((opt) => {
                          const id = `root-${opt.replace(/\s+/g, '-').toLowerCase()}`;
                          const checked = !!(hsProfile.cultural_roots || []).includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setHsProfile(prev => {
                                  const curr = prev.cultural_roots || [];
                                  const exists = curr.includes(opt);
                                  return {
                                    ...prev,
                                    cultural_roots: exists
                                      ? curr.filter(r => r !== opt)
                                      : [...curr, opt],
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
                    {hsProfile.cultural_roots && hsProfile.cultural_roots.length > 0
                      ? hsProfile.cultural_roots.join(', ')
                      : 'Not specified'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Card */}
        <Card className="bg-white/75 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-nil-orange" />
                Social Media Presence
              </CardTitle>
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
                    disabled={updateSocialMutation.isPending}
                    size="sm"
                    className="flex items-center gap-2 bg-nil-orange hover:bg-nil-navy disabled:opacity-50"
                  >
                    {updateSocialMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {updateSocialMutation.isPending ? 'Saving...' : 'Save'}
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
            {!hsProfile.instagram_handle && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No social media connected.</p>
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
                      {hsProfile.instagram_handle
                        ? `@${hsProfile.instagram_handle.replace(/^@+/, '')}`
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                {isEditingSocial && (
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <Input
                      value={hsProfile.instagram_handle || ''}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/^@+/, '').replace(/[^a-zA-Z0-9._-]/g, '');
                        setHsProfile(prev => ({ ...prev, instagram_handle: cleaned }));
                      }}
                      placeholder="username"
                      className="w-40 pl-6"
                      inputMode="text"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HighSchoolAthleteDashboard;
