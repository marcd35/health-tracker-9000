'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Database, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

type ProfileType = 'weight_loss' | 'maintenance' | 'weight_gain';

interface SyntheticDataModalProps {
  children?: React.ReactNode;
  triggerButton?: React.ReactNode;
  onSuccess?: () => void;
}

interface GenerationResult {
  success: boolean;
  message: string;
  profileType: ProfileType;
  daysGenerated: number;
  summary: {
    totalMeals: number;
    daysMetGoal: number;
    totalDays: number;
    averageCalories: number;
    dailyTarget: number;
  };
}

export function SyntheticDataModal(_props: SyntheticDataModalProps) {
  const { triggerButton, onSuccess } = _props;
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ProfileType>('weight_loss');

  const handleGenerate = async (profileType: ProfileType) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/debug/generate-synthetic-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileType, days: 30 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate synthetic data');
      }

      setResult(data);
      // Trigger refresh after successful generation (without closing modal)
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWipeAll = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/debug/wipe-all-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to wipe data');
      }

      setResult({
        success: true,
        message: data.message,
        profileType: 'weight_loss' as ProfileType,
        daysGenerated: 0,
        summary: {
          totalMeals: 0,
          daysMetGoal: 0,
          totalDays: 0,
          averageCalories: 0,
          dailyTarget: 0,
        },
      });
      // Trigger refresh after successful wipe
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const profileTypes: { type: ProfileType; label: string; description: string }[] = [
    {
      type: 'weight_loss',
      label: 'Weight Loss',
      description: 'Calorie deficit with 85% consistency',
    },
    {
      type: 'maintenance',
      label: 'Maintenance',
      description: 'Balanced calories with 90% consistency',
    },
    {
      type: 'weight_gain',
      label: 'Weight Gain',
      description: 'Calorie surplus with 75% consistency',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <Database className="w-4 h-4 mr-2" />
            Generate Test Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Generate Synthetic Test Data
          </DialogTitle>
          <DialogDescription>
            Generate 30 days of realistic meal and calorie tracking data for testing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Profile Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Profile Type</label>
            <div className="grid grid-cols-1 gap-2">
              {profileTypes.map((pt) => (
                <button
                  key={pt.type}
                  onClick={() => setSelectedType(pt.type)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedType === pt.type
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  <div className="font-medium">{pt.label}</div>
                  <div className="text-sm text-muted-foreground">{pt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Wipe All Data Button */}
          <Button
            variant="outline"
            onClick={handleWipeAll}
            disabled={isGenerating}
            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wiping...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Wipe All Data Only
              </>
            )}
          </Button>

          {/* Result Display */}
          {result && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
                <CheckCircle className="w-4 h-4" />
                Data Generated Successfully!
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 space-y-1">
                <p>{result.message}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                  <div>
                    <span className="font-medium">Days:</span> {result.summary.totalDays}
                  </div>
                  <div>
                    <span className="font-medium">Meals:</span> {result.summary.totalMeals}
                  </div>
                  <div>
                    <span className="font-medium">Days on Goal:</span> {result.summary.daysMetGoal}
                  </div>
                  <div>
                    <span className="font-medium">Avg Calories:</span>{' '}
                    {result.summary.averageCalories}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-medium">
                <AlertCircle className="w-4 h-4" />
                Error
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => handleGenerate(selectedType)}
            disabled={isGenerating}
            className="min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Generate 30 Days
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
