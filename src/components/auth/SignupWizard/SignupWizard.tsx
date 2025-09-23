import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CityService, type City } from '@/services/cityService';
import { CollegeService } from '@/services/collegeService';
import { StudentAthleteService } from '@/services/studentAthleteService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface SignupWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type Year = 'FR' | 'SO' | 'JR' | 'SR' | 'RFR' | 'GR' | '';

type Gender = 'M' | 'F' | '';

export const SignupWizard: React.FC<SignupWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1 Photo
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 Basic Info
  const [sport, setSport] = useState('');
  const [year, setYear] = useState<Year>('');
  const [gender, setGender] = useState<Gender>('');

  // School autocomplete
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolSuggestions, setSchoolSuggestions] = useState<Array<{ id: number; name: string }>>([]);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const schoolSearchTimeout = useRef<number | null>(null);
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [collegeFallback, setCollegeFallback] = useState('');

  // City autocomplete
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const citySearchTimeout = useRef<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [hometownFallback, setHometownFallback] = useState('');

  // Step 3 Socials
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramFollowers, setInstagramFollowers] = useState<number | undefined>();
  const [xHandle, setXHandle] = useState('');
  const [xFollowers, setXFollowers] = useState<number | undefined>();
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [tiktokFollowers, setTiktokFollowers] = useState<number | undefined>();

  const { user, profile } = useAuth();

  // Initialize on open
  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    setError(null);
    setSuccessMessage(null);
    setProfileId(null);
    if (user?.id) {
      setProfileId(user.id);
    } else {
      setError('No authenticated user profile found.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Photo handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Please select an image smaller than 5MB.');
      return;
    }
    setSelectedPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canProceedPhoto = !!selectedPhoto;

  const handleUploadPhoto = async () => {
    if (!profileId || !selectedPhoto) return;
    try {
      setLoading(true);
      setError(null);

      // Generate unique filename
      const fileExt = selectedPhoto.name.split('.').pop();
      const fileName = `${profileId}-${Date.now()}.${fileExt}`;
      const filePath = `athlete-photos/${fileName}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('athlete-photos')
        .upload(filePath, selectedPhoto, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('athlete-photos')
        .getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // Ensure athlete row exists, then update photo
      const existing = await StudentAthleteService.fetchStudentAthleteByProfileId(profileId);
      if (!existing) {
        await StudentAthleteService.createStudentAthlete(profileId, (profile?.full_name as any) || 'Unknown', { photo: publicUrl });
      } else {
        await StudentAthleteService.updateStudentAthlete(profileId, { photo: publicUrl });
      }

      setCurrentStep(2);
    } catch (e: any) {
      setError(e?.message || 'Failed to upload photo.');
    } finally {
      setLoading(false);
    }
  };

  // Basic info autocomplete behaviors
  const onSchoolInput = (val: string) => {
    setSchoolQuery(val);
    setShowSchoolSuggestions(!!val);
    setSchoolId(null);
    setCollegeFallback(val);
    if (schoolSearchTimeout.current) window.clearTimeout(schoolSearchTimeout.current);
    schoolSearchTimeout.current = window.setTimeout(async () => {
      try {
        const results = await CollegeService.searchSchoolsByName(val);
        setSchoolSuggestions(results);
      } catch (_) {}
    }, 200);
  };

  const onCityInput = (val: string) => {
    setCityQuery(val);
    setShowCitySuggestions(!!val);
    setCityId(null);
    setHometownFallback(val);
    if (citySearchTimeout.current) window.clearTimeout(citySearchTimeout.current);
    citySearchTimeout.current = window.setTimeout(async () => {
      try {
        const results = await CityService.searchCities(val);
        setCitySuggestions(results);
      } catch (_) {}
    }, 200);
  };

  const canProceedBasic = () => {
    const hasSchool = !!schoolId || (!!collegeFallback && collegeFallback.trim() !== '');
    const hasCity = !!cityId || (!!hometownFallback && hometownFallback.trim() !== '');
    return sport.trim() !== '' && year !== '' && gender !== '' && hasSchool && hasCity;
  };

  const saveBasicInfo = async () => {
    if (!profileId) return;
    try {
      setLoading(true);
      setError(null);
      // Ensure athlete row exists before update
      const existing = await StudentAthleteService.fetchStudentAthleteByProfileId(profileId);
      if (!existing) {
        await StudentAthleteService.createStudentAthlete(profileId, (profile?.full_name as any) || 'Unknown', {
          sport,
          year,
          gender,
          school_id: schoolId ?? null,
          college: schoolId ? undefined : collegeFallback,
          city_id: cityId ?? null,
          hometown: cityId ? undefined : hometownFallback,
        });
      } else {
        await StudentAthleteService.updateStudentAthlete(profileId, {
          sport,
          year,
          gender,
          school_id: schoolId ?? null,
          college: schoolId ? undefined : collegeFallback,
          city_id: cityId ?? null,
          hometown: cityId ? undefined : hometownFallback,
        });
      }
      setCurrentStep(3);
    } catch (e: any) {
      setError(e?.message || 'Failed to save basic information.');
    } finally {
      setLoading(false);
    }
  };

  const hasAnySocial = () => {
    return (
      (instagramHandle && instagramHandle.trim() !== '') ||
      (xHandle && xHandle.trim() !== '') ||
      (tiktokHandle && tiktokHandle.trim() !== '')
    );
  };

  const saveSocialsAndFinalize = async () => {
    if (!profileId) return;
    if (!hasAnySocial()) {
      setError('Please provide at least one social media handle (Instagram, X, or TikTok).');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Persist socials only (no verification flow)
      await StudentAthleteService.updateStudentAthlete(profileId, {
        instagram_handle: instagramHandle || undefined,
        instagram_followers: instagramFollowers,
        x_handle: xHandle || undefined,
        x_followers: xFollowers,
        tiktok_handle: tiktokHandle || undefined,
        tiktok_followers: tiktokFollowers,
      });
      setSuccessMessage('Your account has been set up!');
      // Close wizard and navigate user to dashboard
      onClose();
      try { window.location.href = '/athlete/dashboard'; } catch {}
    } catch (e: any) {
      setError(e?.message || 'Failed to save social media details.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    // No verification flow when email verification is disabled

    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <Label>Upload Profile Photo</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No photo</div>
              )}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                Choose File
              </Button>
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={handleUploadPhoto} disabled={!canProceedPhoto || loading} className="bg-nil-orange hover:bg-nil-navy">
              {loading ? 'Uploading...' : 'Next'}
            </Button>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-4">
          <Label>Basic Information</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sport</Label>
              <Input value={sport} onChange={(e) => setSport(e.target.value)} placeholder="Enter your sport" />
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={year} onValueChange={(v) => setYear(v as Year)}>
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
            </div>
            <div className="space-y-2 relative md:col-span-2">
              <Label>College/University</Label>
              <Input
                value={schoolQuery}
                onChange={(e) => onSchoolInput(e.target.value)}
                onFocus={() => setShowSchoolSuggestions(!!schoolQuery)}
                onBlur={() => setTimeout(() => setShowSchoolSuggestions(false), 150)}
                placeholder="Search your college or university"
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
                        onMouseDown={() => {
                          setSchoolId(s.id);
                          setSchoolQuery(s.name);
                          setCollegeFallback(s.name);
                          setShowSchoolSuggestions(false);
                        }}
                      >
                        {s.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2 relative md:col-span-2">
              <Label>Hometown</Label>
              <Input
                value={cityQuery}
                onChange={(e) => onCityInput(e.target.value)}
                onFocus={() => setShowCitySuggestions(!!cityQuery)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                placeholder="Search city (e.g., Los Angeles, CA) or ZIP"
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
                        onMouseDown={() => {
                          setCityId(c.id);
                          const label = CityService.formatCityLabel(c);
                          setCityQuery(label);
                          setHometownFallback(label);
                          setShowCitySuggestions(false);
                        }}
                      >
                        {CityService.formatCityLabel(c)}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} disabled={loading}>Back</Button>
            <Button type="button" onClick={saveBasicInfo} disabled={!canProceedBasic() || loading} className="bg-nil-orange hover:bg-nil-navy">
              {loading ? 'Saving...' : 'Next'}
            </Button>
          </div>
        </div>
      );
    }

    // Step 3
    return (
      <div className="space-y-4">
        <Label>Social Media Presence</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Instagram Handle</Label>
            <Input value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@yourhandle" />
          </div>
          <div className="space-y-2">
            <Label>Instagram Followers</Label>
            <Input type="number" value={instagramFollowers ?? ''} onChange={(e) => setInstagramFollowers(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g., 1200" />
          </div>
          <div className="space-y-2">
            <Label>X (Twitter) Handle</Label>
            <Input value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="@yourhandle" />
          </div>
          <div className="space-y-2">
            <Label>X Followers</Label>
            <Input type="number" value={xFollowers ?? ''} onChange={(e) => setXFollowers(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g., 800" />
          </div>
          <div className="space-y-2">
            <Label>TikTok Handle</Label>
            <Input value={tiktokHandle} onChange={(e) => setTiktokHandle(e.target.value)} placeholder="@yourhandle" />
          </div>
          <div className="space-y-2">
            <Label>TikTok Followers</Label>
            <Input type="number" value={tiktokFollowers ?? ''} onChange={(e) => setTiktokFollowers(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g., 2300" />
          </div>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex justify-between gap-2">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} disabled={loading}>Back</Button>
          <Button type="button" onClick={saveSocialsAndFinalize} disabled={!hasAnySocial() || loading} className="bg-nil-orange hover:bg-nil-navy">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-[560px] max-h-[90vh] overflow-y-auto px-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-nil-navy">
            {currentStep === 1 ? 'Upload Profile Photo' : currentStep === 2 ? 'Basic Information' : 'Social Media Presence'}
          </DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default SignupWizard;
