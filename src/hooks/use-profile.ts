import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Profile } from '@/lib/supabase'

/**
 * Fetch profile from API
 */
async function fetchProfile(): Promise<Profile> {
  const response = await fetch('/api/profile', {
    // Add cache headers
    next: { revalidate: 30 }, // Revalidate every 30 seconds
  })

  if (!response.ok) {
    if (response.status === 401) {
      // User not authenticated, redirect to login
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
    throw new Error('Failed to fetch profile')
  }

  return response.json()
}

/**
 * Update profile via API
 */
async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update profile')
  }

  return response.json()
}

/**
 * React Query hook for fetching profile
 * Automatically deduplicates requests and caches data
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

/**
 * React Query hook for updating profile
 * Automatically invalidates and refetches profile after mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(['profile'], data)
      // Optionally refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error) => {
      console.error('❌ Error updating profile:', error)
    },
  })
}

