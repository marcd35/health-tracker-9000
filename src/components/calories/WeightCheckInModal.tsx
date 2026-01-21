'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Scale } from 'lucide-react';

interface WeightCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWeight: number | null;
  onSuccess?: () => void;
}

export function WeightCheckInModal({
  open,
  onOpenChange,
  currentWeight,
  onSuccess,
}: WeightCheckInModalProps) {
  const [weight, setWeight] = useState(currentWeight?.toString() || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const weightValue = parseFloat(weight);

    // Validation
    if (!weight || isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: 'Invalid Weight',
        description: 'Please enter a valid weight in pounds',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/weight-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: weightValue,
          date,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log weight');
      }

      toast({
        title: 'Weight Logged',
        description: `Successfully recorded ${weightValue} lbs for ${date}`,
      });

      // Reset form
      setWeight('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');

      // Close modal and trigger success callback
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error logging weight:', error);
      toast({
        title: 'Error',
        description: 'Failed to log weight. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Quick Weight Check-In
          </DialogTitle>
          <DialogDescription>
            Log your current weight to track progress over time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="185.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              type="text"
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Placeholder for future feature */}
          <div className="pt-2 border-t border-border">
            <Label className="text-muted-foreground">How are you feeling today?</Label>
            <p className="text-sm text-muted-foreground mt-1">Mood tracking coming soon...</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Weight'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
