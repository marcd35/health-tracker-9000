'use client';

import { useState } from 'react';
import { format, set as setTime } from 'date-fns';
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
import type { SupplementLog } from '@/lib/types/supplements';

interface EditLogDialogProps {
  log: SupplementLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (logId: string, takenAt: string) => void;
}

function EditLogForm({
  log,
  onSave,
  onCancel,
}: {
  log: SupplementLog;
  onSave: (logId: string, takenAt: string) => void;
  onCancel: () => void;
}) {
  const initialTime = log.takenAt ? format(new Date(log.takenAt), 'HH:mm') : '';
  const [time, setTimeValue] = useState(initialTime);

  const handleSave = () => {
    if (!time) return;

    // Parse the time and combine with the log's date
    const logDate = new Date(log.takenAt || log.date);
    const [hours, minutes] = time.split(':').map(Number);

    // Create new timestamp with the updated time
    const updatedDate = setTime(logDate, {
      hours,
      minutes,
      seconds: 0,
      milliseconds: 0,
    });

    onSave(log.id, updatedDate.toISOString());
  };

  const logDate = format(new Date(log.date), 'MMMM d, yyyy');

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="date" className="text-sm font-medium">
            Date
          </Label>
          <Input id="date" value={logDate} disabled className="bg-muted" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="time" className="text-sm font-medium">
            Time
          </Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTimeValue(e.target.value)}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!time}>
          Save Changes
        </Button>
      </DialogFooter>
    </>
  );
}

export function EditLogDialog({ log, open, onOpenChange, onSave }: EditLogDialogProps) {
  const handleSave = (logId: string, takenAt: string) => {
    onSave(logId, takenAt);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Log Time</DialogTitle>
          <DialogDescription>
            {log && `Update the time for ${log.supplementName}`}
          </DialogDescription>
        </DialogHeader>
        {log && <EditLogForm key={log.id} log={log} onSave={handleSave} onCancel={handleCancel} />}
      </DialogContent>
    </Dialog>
  );
}
