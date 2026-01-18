import { useEffect } from 'react';
import { useHealthStore } from '@/lib/store/healthStore';

export function useProfile() {
  const { profile, isLoading, error, fetchProfile, updateProfile } = useHealthStore();

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, [profile, fetchProfile]);

  return { profile, isLoading, error, updateProfile };
}
