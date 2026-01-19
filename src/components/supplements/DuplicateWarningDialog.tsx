'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SupplementLog } from '@/lib/types/supplements';
import { format } from 'date-fns';

interface DuplicateWarningDialogProps {
  supplementName?: string;
  existingLogs: SupplementLog[];
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DuplicateWarningDialog({
  supplementName,
  existingLogs,
  open,
  onConfirm,
  onCancel,
}: DuplicateWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate Log Detected</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                You have already logged <span className="font-semibold">{supplementName}</span>{' '}
                today:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {existingLogs.map((log) => (
                  <li key={log.id}>
                    {log.takenAt ? format(new Date(log.takenAt), 'h:mm a') : 'Time not recorded'}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to log it again? This will create a duplicate entry.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Log Anyway</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
