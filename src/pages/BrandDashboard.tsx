import React, { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Building2, ArrowLeft, Camera, User } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import PhotoCropperModal from '@/components/PhotoCropperModal';
import { useBrandRepresentative } from '@/hooks/useBrandRepresentative';
import { BrandRepresentativeService } from '@/services/brandRepresentativeService';

const BrandDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const { brandRepresentative, refetch, updateBrandRepresentative, createBrandRepresentative, isUpdating } = useBrandRepresentative(profile?.id);

  // Photo upload state (mirrors AthleteDashboard)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Upload mutation (mirrors AthleteDashboard)
  const photoUploadMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!profile?.id) throw new Error('No profile ID available');
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      // Path should be RELATIVE TO the bucket; do not include the bucket name again
      const filePath = `${fileName}`;
      const { error } = await supabase.storage
        .from('brand-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true, contentType: file.type || 'image/jpeg' });
      if (error) throw new Error(`Failed to upload photo: ${error.message}`);
      const { data: { publicUrl } } = supabase.storage.from('brand-photos').getPublicUrl(filePath);
      return publicUrl;
    }
  });

  // Update mutation (mirrors AthleteDashboard save flow + full refresh)
  const updatePhotoMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('No profile ID available');
      let photoUrl: string | undefined = brandRepresentative?.photo || undefined;
      if (selectedPhoto) {
        photoUrl = await photoUploadMutation.mutateAsync(selectedPhoto);
      }
      if (brandRepresentative) {
        await BrandRepresentativeService.updateBrandRepresentative(profile.id, { photo: photoUrl || null });
      } else {
        await BrandRepresentativeService.createBrandRepresentative(profile.id, { photo: photoUrl || null });
      }
    },
    onSuccess: async () => {
      await refetch();
      setSelectedPhoto(null);
      setPhotoPreview(null);
      try { window.location.reload(); } catch {}
    }
  });

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
                  <InfoTooltip 
                    variant="desktop" 
                    title="Profile Information"
                    content={"Complete 100% of your profile to help ÑILHispanic™ match you with Hispanic Student-Athletes."}
                  />
                </div>
                <p className="text-gray-600 mt-1">
                  Manage your ÑILHispanic™ Brand Representative Profile
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Header Card (mirrors AthleteDashboard) */}
        <Card className="mb-6 bg-white/75 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {photoPreview || brandRepresentative?.photo ? (
                    <img
                      src={photoPreview || (brandRepresentative?.photo as string)}
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
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-nil-orange hover:bg-nil-navy text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
                    if (file.size > 5 * 1024 * 1024) { alert('Please select an image smaller than 5MB.'); return; }
                    setSelectedPhoto(file);
                    const reader = new FileReader();
                    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name || user?.email || 'Brand Representative'}</h2>
                  <div className="px-3 py-1 bg-nil-orange text-white text-sm rounded-full">
                    Brand Representative
                  </div>
                </div>
                {user?.email && (
                  <div className="text-gray-600 text-sm mb-2 break-all">{user.email}</div>
                )}
                {(selectedPhoto || photoPreview) && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => updatePhotoMutation.mutate()}
                      disabled={updatePhotoMutation.isPending || isUpdating}
                      size="sm"
                      className="bg-nil-orange hover:bg-nil-navy"
                    >
                      {updatePhotoMutation.isPending ? 'Saving...' : 'Save Photo'}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedPhoto(null);
                        setPhotoPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
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
          onSave={(file, previewUrl) => {
            setSelectedPhoto(file);
            setPhotoPreview(previewUrl);
            setIsPhotoModalOpen(false);
          }}
          initialImageUrl={(brandRepresentative?.photo as string) || null}
          title="Update Profile Photo"
        />
      </div>
    </div>
  );
};

export default BrandDashboard;
