'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Supplement } from '@/lib/types/supplements';
import { AlertCircle } from 'lucide-react';
import { useSupplementStore } from '@/lib/store/supplementStore';

interface TakeEarlierDialogProps {
  supplement: Supplement | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (date: string, time: string) => void;
}

export function TakeEarlierDialog({ supplement, open, onClose, onSubmit }: TakeEarlierDialogProps) {
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const checkDuplicateLog = useSupplementStore((state) => state.checkDuplicateLog);

  if (!supplement) return null;

  const isDuplicate = date && supplement ? checkDuplicateLog(supplement.id, date) : false;

  const handleSubmit = () => {
    if (date && time) {
      onSubmit(date, time);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Earlier Time</DialogTitle>
          <DialogDescription>Log when you took {supplement.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>

          {/* Duplicate Warning */}
          {isDuplicate && (
            <div className="flex items-start gap-2 p-3 border border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 rounded-md text-sm">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  Duplicate Warning
                </p>
                <p className="text-yellow-700 dark:text-yellow-400 mt-0.5">
                  You already logged this supplement on {date}. Logging again will create a
                  duplicate entry.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!date || !time}>
            Log Supplement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
