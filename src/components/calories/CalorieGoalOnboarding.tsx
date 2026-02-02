'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCalorieTrackerStore } from '@/lib/store/calorieTrackerStore';
import { useHealthStore } from '@/lib/store/healthStore';
import type { GoalType, ActivityLevel } from '@/lib/types/calorieTracking';

interface CalorieGoalOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type OnboardingStep =
  | 'profileSetup'
  | 'goalType'
  | 'weeklyTarget'
  | 'activityLevel'
  | 'confirmation';

export function CalorieGoalOnboarding({ open, onOpenChange }: CalorieGoalOnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('profileSetup');
  const [selectedGoal, setSelectedGoal] = useState<GoalType>('maintenance');
  const [weeklyTarget, setWeeklyTarget] = useState(-3500); // 1 lb/week loss
  const [selectedActivity, setSelectedActivity] = useState<ActivityLevel>('moderate');
  const [isLoading, setIsLoading] = useState(false);

  // Profile info fields
  const [profileData, setProfileData] = useState({
    displayName: '',
    age: 30,
    weight: 75,
    height: 175,
    gender: 'male' as const,
    activityLevel: 'moderate' as ActivityLevel,
  });

  const healthProfile = useHealthStore((state) => state.profile);
  const createProfile = useHealthStore((state) => state.createProfile);
  const updateProfile = useHealthStore((state) => state.updateProfile);
  const createGoal = useCalorieTrackerStore((state) => state.createGoal);
  const dismissOnboarding = useCalorieTrackerStore((state) => state.dismissOnboarding);

  // Reset to first step when modal closes
  useEffect(() => {
    if (!open) {
      setStep('profileSetup');
    }
  }, [open]);

  // Skip profile setup if profile already exists when opening
  useEffect(() => {
    if (!open) return;
    if (healthProfile) {
      setStep('goalType');
      // Pre-fill profile data in case user goes back
      setProfileData({
        displayName: healthProfile.displayName || '',
        age: healthProfile.age,
        weight: healthProfile.weight,
        height: healthProfile.height,
        gender: healthProfile.gender,
        activityLevel: healthProfile.activityLevel,
      });
    } else {
      setStep('profileSetup');
    }
  }, [open, healthProfile]);

  const goalOptions: Array<{ type: GoalType; label: string; description: string }> = [
    {
      type: 'weight_loss',
      label: 'Weight Loss',
      description: 'Lose weight gradually and sustainably',
    },
    {
      type: 'maintenance',
      label: 'Maintenance',
      description: 'Maintain your current weight',
    },
    {
      type: 'gain',
      label: 'Weight Gain',
      description: 'Build muscle and gain weight',
    },
  ];

  const activityOptions: Array<{ level: ActivityLevel; label: string; description: string }> = [
    {
      level: 'sedentary',
      label: 'Sedentary',
      description: 'Little or no exercise, desk job',
    },
    {
      level: 'light',
      label: 'Lightly Active',
      description: 'Light exercise 1-3 days/week',
    },
    {
      level: 'moderate',
      label: 'Moderately Active',
      description: 'Moderate exercise 3-5 days/week',
    },
    {
      level: 'active',
      label: 'Very Active',
      description: 'Intense exercise 6-7 days/week',
    },
    {
      level: 'very_active',
      label: 'Extremely Active',
      description: 'Very intense exercise or physical job',
    },
  ];

  const calculateWeeklyToPounds = (weekly: number): number => {
    return Math.round((Math.abs(weekly) / 3500) * 10) / 10;
  };

  const calculateDailyTarget = (): number => {
    // Approximate TDEE calculation for reference (will be calculated server-side)
    const baseTDEE = 2000; // placeholder
    return Math.round(baseTDEE + weeklyTarget / 7);
  };

  const handleNext = async () => {
    if (step === 'profileSetup') {
      // Validate profile data
      if (!profileData.age || profileData.age <= 0 || profileData.age > 120) {
        return;
      }
      if (!profileData.weight || profileData.weight <= 0 || profileData.weight > 300) {
        return;
      }
      if (!profileData.height || profileData.height <= 0 || profileData.height > 250) {
        return;
      }

      // Create or update profile
      setIsLoading(true);
      try {
        if (healthProfile) {
          // Update existing profile
          await updateProfile({
            displayName: profileData.displayName || undefined,
            age: profileData.age,
            weight: profileData.weight,
            height: profileData.height,
            gender: profileData.gender,
            activityLevel: profileData.activityLevel,
          });
        } else {
          // Create new profile
          await createProfile({
            displayName: profileData.displayName || undefined,
            age: profileData.age,
            weight: profileData.weight,
            height: profileData.height,
            gender: profileData.gender,
            activityLevel: profileData.activityLevel,
            healthConditions: [],
            allergies: [],
          });
        }
        setStep('goalType');
      } catch (error) {
        console.error('Failed to save profile:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Regular navigation
      switch (step) {
        case 'goalType':
          setStep('weeklyTarget');
          break;
        case 'weeklyTarget':
          setStep('activityLevel');
          break;
        case 'activityLevel':
          setStep('confirmation');
          break;
      }
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'goalType':
        setStep('profileSetup');
        break;
      case 'weeklyTarget':
        setStep('goalType');
        break;
      case 'activityLevel':
        setStep('weeklyTarget');
        break;
      case 'confirmation':
        setStep('activityLevel');
        break;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await createGoal({
        goalType: selectedGoal,
        weeklyCalorieTarget: weeklyTarget,
        activityLevel: selectedActivity,
      });
      onOpenChange(false);
      setStep('goalType');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissForever = () => {
    dismissOnboarding(true);
    onOpenChange(false);
  };

  const poundsPerWeek = calculateWeeklyToPounds(weeklyTarget);
  const dailyTarget = calculateDailyTarget();
  const canGoBack = step !== 'profileSetup';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'profileSetup' ? 'Set Up Your Profile' : 'Set Up Your Calorie Goal'}
          </DialogTitle>
          <DialogDescription>
            {step === 'profileSetup'
              ? "We'll need some basic info to get started"
              : "Let's personalize your tracking experience"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Setup */}
          {step === 'profileSetup' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Your Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your name"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {healthProfile
                    ? 'Your display name (updating existing profile)'
                    : 'Used to create your unique profile ID'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={profileData.age}
                  onChange={(e) =>
                    setProfileData({ ...profileData, age: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={profileData.gender}
                  onValueChange={(value) =>
                    setProfileData({
                      ...profileData,
                      gender: value as 'male' | 'female' | 'other',
                    })
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="1"
                    max="300"
                    value={profileData.weight}
                    onChange={(e) =>
                      setProfileData({ ...profileData, weight: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    max="250"
                    value={profileData.height}
                    onChange={(e) =>
                      setProfileData({ ...profileData, height: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={profileData.activityLevel}
                  onValueChange={(value) =>
                    setProfileData({
                      ...profileData,
                      activityLevel: value as ActivityLevel,
                    })
                  }
                >
                  <SelectTrigger id="activity">
                    <SelectValue />
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
            </div>
          )}

          {/* Goal Type Selection */}
          {step === 'goalType' && (
            <div className="space-y-3">
              <p className="text-sm font-medium">What's your primary fitness goal?</p>
              {goalOptions.map((option) => (
                <Card
                  key={option.type}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedGoal === option.type
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedGoal(option.type)}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </Card>
              ))}
            </div>
          )}

          {/* Weekly Target Selection */}
          {step === 'weeklyTarget' && (
            <div className="space-y-4">
              <p className="text-sm font-medium">
                {selectedGoal === 'weight_loss'
                  ? 'How many pounds per week do you want to lose?'
                  : selectedGoal === 'gain'
                    ? 'How many pounds per week do you want to gain?'
                    : 'Weekly calorie adjustment'}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{poundsPerWeek} lbs/week</span>
                  <span className="text-xs text-muted-foreground">{weeklyTarget} cal/week</span>
                </div>
                <input
                  type="range"
                  min={selectedGoal === 'weight_loss' ? -7000 : 0}
                  max={selectedGoal === 'weight_loss' ? 0 : 7000}
                  step="500"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <Card className="p-3 bg-blue-50 border-blue-200">
                <p className="text-xs">
                  <strong>Daily target:</strong> ~{dailyTarget} calories
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedGoal === 'weight_loss'
                    ? 'This creates a daily deficit to lose weight gradually'
                    : selectedGoal === 'gain'
                      ? 'This creates a daily surplus to support muscle growth'
                      : 'This maintains your current weight'}
                </p>
              </Card>
            </div>
          )}

          {/* Activity Level Selection */}
          {step === 'activityLevel' && (
            <div className="space-y-3">
              <p className="text-sm font-medium">What's your activity level?</p>
              {activityOptions.map((option) => (
                <Card
                  key={option.level}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedActivity === option.level
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedActivity(option.level)}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </Card>
              ))}
            </div>
          )}

          {/* Confirmation */}
          {step === 'confirmation' && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Confirm your settings</p>
              <Card className="p-4 space-y-2 bg-background">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Goal:</span>
                  <span className="font-medium">
                    {goalOptions.find((g) => g.type === selectedGoal)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Weekly Target:</span>
                  <span className="font-medium">{poundsPerWeek} lbs/week</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Activity Level:</span>
                  <span className="font-medium">
                    {activityOptions.find((a) => a.level === selectedActivity)?.label}
                  </span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Daily Calorie Target:</span>
                    <span className="text-lg font-bold text-primary">{dailyTarget}</span>
                  </div>
                </div>
              </Card>

              <p className="text-xs text-muted-foreground">
                Your precise calorie target will be calculated based on your profile information
                (weight, height, age, gender).
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            {canGoBack && (
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step !== 'confirmation' ? (
              <>
                <Button variant="outline" onClick={handleDismissForever} disabled={isLoading}>
                  Set Up Later
                </Button>
                <Button onClick={handleNext} disabled={isLoading}>
                  {step === 'profileSetup'
                    ? healthProfile
                      ? 'Update Profile'
                      : 'Create Profile'
                    : 'Next'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={handleDismissForever}
                  disabled={isLoading}
                  className="text-xs"
                >
                  Dismiss
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Goal'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Dismiss Forever Option */}
        <div className="text-center pt-2">
          <button
            onClick={handleDismissForever}
            disabled={isLoading}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss forever
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
