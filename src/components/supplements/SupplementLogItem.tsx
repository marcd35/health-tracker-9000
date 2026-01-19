'use client';

import { format } from 'date-fns';
import { Clock, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SupplementLog, Supplement } from '@/lib/types/supplements';

interface SupplementLogItemProps {
  log: SupplementLog;
  supplement?: Supplement;
  onEdit: () => void;
  onDelete: () => void;
}

export function SupplementLogItem({ log, supplement, onEdit, onDelete }: SupplementLogItemProps) {
  const time = log.takenAt ? format(new Date(log.takenAt), 'h:mm a') : 'Unknown time';

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        {supplement && (
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: supplement.color }} />
        )}
        <div>
          <p className="text-sm font-medium">{log.supplementName}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{time}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onEdit}
          title="Edit time"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          title="Delete log"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
