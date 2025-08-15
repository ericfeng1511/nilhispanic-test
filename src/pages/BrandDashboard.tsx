import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBrandRepresentative } from '@/hooks/useBrandRepresentative';
import { Navigate, Link } from 'react-router-dom';
import { User, Building2, Calendar, MessageSquare, Settings, BarChart3, Edit3, Save, X, ArrowLeft, Camera, Upload, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BrandProfile {
  brand: string;          // Company Name
  title: string;          // Title
  department: string;     // Department
  bio: string;           // Bio
  logo?: string;         // Logo
  email: string;         // Email
  linkedin_url: string;  // LinkedIn URL
  website_url: string;   // Website URL
}

const BrandDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { 
    brandRepresentative, 
    isLoading, 
    updateBrandRepresentative, 
    createBrandRepresentative,
    isUpdating 
  } = useBrandRepresentative(user?.id);

  // Redirect if not brand user
  if (profile?.role !== 'brand') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nil-navy to-nil-light-blue flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-nil-orange mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">This dashboard is only available to brand representatives.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [brandProfile, setBrandProfile] = useState<BrandProfile>({
    brand: '',
    title: '',
    department: '',
    bio: '',
    logo: '',
    email: '',
    linkedin_url: '',
    website_url: ''
  });

  const [originalProfile, setOriginalProfile] = useState<BrandProfile>({
    brand: '',
    title: '',
    department: '',
    bio: '',
    email: '',
    linkedin_url: '',
    website_url: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  // Load brand representative data when it becomes available
  useEffect(() => {
    if (brandRepresentative) {
      const brandProfileData: BrandProfile = {
        brand: brandRepresentative.brand || '',
        title: brandRepresentative.title || '',
        department: brandRepresentative.department || '',
        bio: brandRepresentative.bio || '',
        email: brandRepresentative.email || '',
        linkedin_url: brandRepresentative.linkedin_url || '',
        website_url: brandRepresentative.website_url || ''
      };
      setBrandProfile(brandProfileData);
      setOriginalProfile(brandProfileData);
    }
  }, [brandRepresentative]);

  // Logo upload state
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      console.log(' Saving brand profile:', brandProfile);
      
      if (brandRepresentative) {
        // Update existing brand representative
        await updateBrandRepresentative({
          profileId: user.id,
          updates: brandProfile
        });
      } else {
        // Create new brand representative (fallback if not auto-created)
        await createBrandRepresentative({
          profileId: user.id,
          brandData: brandProfile
        });
      }
      
      setOriginalProfile({ ...brandProfile });
      setIsEditing(false);
      console.log(' Brand profile saved successfully');
    } catch (error) {
      console.error(' Failed to save brand profile:', error);
      // Could add toast notification here
    }
  };

  const handleCancel = () => {
    setBrandProfile({ ...originalProfile });
    setIsEditing(false);
  };

  // Logo upload handlers
  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedLogo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveLogo = () => {
    setSelectedLogo(null);
    setLogoPreview(null);
    setBrandProfile(prev => ({ ...prev, logo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              aria-label="Go back to homepage"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand Dashboard</h1>
              <p className="text-gray-600">Manage your brand profile and campaigns</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Welcome, {profile?.full_name}</span>
            <div className="w-8 h-8 bg-nil-orange rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-nil-orange" />
                Brand Profile
              </CardTitle>
              <CardDescription>
                Manage your brand information and social media presence
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="bg-nil-orange hover:bg-nil-orange/90 text-white"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-nil-orange hover:bg-nil-orange/90 text-white"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload Section */}
            <div className="space-y-4">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoPreview || brandProfile.logo ? (
                    <img 
                      src={logoPreview || brandProfile.logo} 
                      alt="Company logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleLogoUploadClick}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    {(logoPreview || brandProfile.logo) && (
                      <Button
                        type="button"
                        onClick={handleRemoveLogo}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="brand">Company Name</Label>
                {isEditing ? (
                  <Input
                    id="brand"
                    value={brandProfile.brand}
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Enter company name"
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {brandProfile.brand || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={brandProfile.title}
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Marketing Manager, Brand Director"
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {brandProfile.title || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                {isEditing ? (
                  <Input
                    id="department"
                    value={brandProfile.department}
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g., Marketing, Sports Marketing, Brand"
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {brandProfile.department || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={brandProfile.bio}
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself and your role..."
                    className="w-full min-h-[120px] resize-none"
                    rows={5}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md min-h-[120px]">
                    {brandProfile.bio || 'Not specified'}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="space-y-6 pt-6 border-t">
              <h4 className="font-medium text-lg text-gray-900">Contact Info</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={brandProfile.email}
                      onChange={(e) => setBrandProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@company.com"
                      className="w-full"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {brandProfile.email || 'Not specified'}
                    </div>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn</Label>
                  {isEditing ? (
                    <Input
                      id="linkedin_url"
                      value={brandProfile.linkedin_url}
                      onChange={(e) => setBrandProfile(prev => ({ ...prev, linkedin_url: e.target.value }))}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {brandProfile.linkedin_url || 'Not specified'}
                    </div>
                  )}
                </div>

                {/* Website */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website_url">Website</Label>
                  {isEditing ? (
                    <Input
                      id="website_url"
                      value={brandProfile.website_url}
                      onChange={(e) => setBrandProfile(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://www.yourcompany.com"
                      className="w-full"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {brandProfile.website_url || 'Not specified'}
                    </div>
                  )}
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
                <BarChart3 className="w-5 h-5 text-nil-orange" />
                Campaign Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Track performance of your NIL campaigns and partnerships.</p>
              <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-nil-orange" />
                Athlete Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Connect and communicate with student-athletes.</p>
              <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-nil-orange" />
                Campaign Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Create and manage NIL campaigns and partnerships.</p>
              <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;
