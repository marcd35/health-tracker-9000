'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, ShieldAlert, Heart, Save, X } from 'lucide-react';
import { useHealthStore } from '@/lib/store/healthStore';
import { UserProfile } from '@/lib/types/health';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { toast } from 'sonner';
import { AddItemDialog } from '@/components/profile/AddItemDialog';
import { COMMON_CONDITIONS, COMMON_ALLERGIES } from '@/constants/healthOptions';

function ProfileForm({
  profile,
  onSave,
  isLoading,
}: {
  profile: UserProfile;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '', // ADD THIS
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    activityLevel: profile.activityLevel,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.age <= 0 || formData.age > 120) newErrors.age = 'Age must be between 1 and 120';
    if (formData.weight <= 0 || formData.weight > 300)
      newErrors.weight = 'Enter a valid weight (1-300kg)';
    if (formData.height <= 0 || formData.height > 250)
      newErrors.height = 'Enter a valid height (1-250cm)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }
    try {
      await onSave(formData);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Personal Information</CardTitle>
          </div>
          <CardDescription>Your display name shown on the dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Enter your name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Used in dashboard greetings and personalized messages
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Physical Metrics</CardTitle>
          </div>
          <CardDescription>Basis for BMR and TDEE calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => {
                  setFormData({ ...formData, age: parseInt(e.target.value) || 0 });
                  if (errors.age) setErrors({ ...errors, age: '' });
                }}
                className={errors.age ? 'border-destructive' : ''}
              />
              {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData({ ...formData, gender: v as any })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => {
                  setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 });
                  if (errors.weight) setErrors({ ...errors, weight: '' });
                }}
                className={errors.weight ? 'border-destructive' : ''}
              />
              {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => {
                  setFormData({ ...formData, height: parseFloat(e.target.value) || 0 });
                  if (errors.height) setErrors({ ...errors, height: '' });
                }}
                className={errors.height ? 'border-destructive' : ''}
              />
              {errors.height && <p className="text-xs text-destructive">{errors.height}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity">Activity Level</Label>
            <Select
              value={formData.activityLevel}
              onValueChange={(v) => setFormData({ ...formData, activityLevel: v as any })}
            >
              <SelectTrigger id="activity">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Light Activity</SelectItem>
                <SelectItem value="moderate">Moderate Activity</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="very_active">Very Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button className="w-full gap-2" onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4" />
            Save Metrics
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-orange-500" />
              <CardTitle>Health Conditions</CardTitle>
            </div>
            <CardDescription>Flags and recommendations trigger here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.healthConditions.map((c) => (
                <div
                  key={c}
                  className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium border border-orange-500/20 capitalize flex items-center gap-2"
                >
                  {c}
                  <button
                    onClick={() => {
                      const updated = profile.healthConditions.filter((item) => item !== c);
                      onSave({ ...profile, healthConditions: updated });
                    }}
                    className="hover:bg-orange-500/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <AddItemDialog
                title="Add Health Condition"
                description="Search for a condition or add a custom one."
                triggerLabel="Add Condition"
                items={COMMON_CONDITIONS}
                existingItems={profile.healthConditions}
                onAdd={(item) => {
                  onSave({
                    ...profile,
                    healthConditions: [...profile.healthConditions, item],
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <CardTitle>Allergies</CardTitle>
            </div>
            <CardDescription>Safety checks during meal logging</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((a) => (
                <div
                  key={a}
                  className="bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium border border-red-500/20 capitalize flex items-center gap-2"
                >
                  {a}
                  <button
                    onClick={() => {
                      const updated = profile.allergies.filter((item) => item !== a);
                      onSave({ ...profile, allergies: updated });
                    }}
                    className="hover:bg-red-500/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <AddItemDialog
                title="Add Allergy"
                description="Search for an allergy or add a custom one."
                triggerLabel="Add Allergy"
                items={COMMON_ALLERGIES}
                existingItems={profile.allergies}
                onAdd={(item) => {
                  onSave({
                    ...profile,
                    allergies: [...profile.allergies, item],
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, isLoading, fetchProfile, updateProfile } = useHealthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your physical metrics, health conditions, and preferences.
          </p>
        </div>
      </div>

      <ProfileForm profile={profile} onSave={updateProfile} isLoading={isLoading} />
    </div>
  );
}
