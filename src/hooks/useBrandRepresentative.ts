import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BrandRepresentativeService, BrandRepresentative } from '@/services/brandRepresentativeService';

export const useBrandRepresentative = (profileId: string | undefined) => {
  const queryClient = useQueryClient();

  // Query to fetch brand representative data
  const {
    data: brandRepresentative,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['brandRepresentative', profileId],
    queryFn: () => profileId ? BrandRepresentativeService.fetchBrandRepresentativeByProfileId(profileId) : null,
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation to update brand representative
  const updateMutation = useMutation({
    mutationFn: ({ 
      profileId, 
      updates 
    }: { 
      profileId: string; 
      updates: Partial<Pick<BrandRepresentative, 'name' | 'brand' | 'title' | 'department' | 'bio' | 'email' | 'linkedin_url' | 'website_url' | 'logo'>>
    }) => BrandRepresentativeService.updateBrandRepresentative(profileId, updates),
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['brandRepresentative', profileId], data);
      console.log('✅ Brand representative cache updated');
    },
    onError: (error) => {
      console.error('❌ Failed to update brand representative:', error);
    }
  });

  // Mutation to create brand representative (fallback if not auto-created)
  const createMutation = useMutation({
    mutationFn: ({ 
      profileId, 
      brandData 
    }: { 
      profileId: string; 
      brandData: Partial<Pick<BrandRepresentative, 'name' | 'brand' | 'title' | 'department' | 'bio' | 'email' | 'linkedin_url' | 'website_url' | 'logo'>>
    }) => BrandRepresentativeService.createBrandRepresentative(profileId, brandData),
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['brandRepresentative', profileId], data);
      console.log('✅ Brand representative created and cache updated');
    },
    onError: (error) => {
      console.error('❌ Failed to create brand representative:', error);
    }
  });

  return {
    brandRepresentative,
    isLoading,
    error,
    refetch,
    updateBrandRepresentative: updateMutation.mutateAsync,
    createBrandRepresentative: createMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isCreating: createMutation.isPending,
    updateError: updateMutation.error,
    createError: createMutation.error,
  };
};
