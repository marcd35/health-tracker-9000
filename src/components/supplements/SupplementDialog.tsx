'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SupplementForm } from './SupplementForm';
import type { Supplement, SupplementFormData, SupplementType } from '@/lib/types/supplements';

interface SupplementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplement?: Supplement;
  supplementType?: SupplementType;
  onSubmit: (data: SupplementFormData) => void;
  isLoading?: boolean;
}

export function SupplementDialog({
  open,
  onOpenChange,
  supplement,
  supplementType,
  onSubmit,
  isLoading,
}: SupplementDialogProps) {
  const handleSubmit = (data: SupplementFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supplement ? 'Edit Supplement' : 'Add Supplement'}</DialogTitle>
          <DialogDescription>
            {supplement
              ? 'Update the supplement details below.'
              : 'Enter the details for your new supplement.'}
          </DialogDescription>
        </DialogHeader>
        <SupplementForm
          initialData={supplement}
          supplementType={supplementType}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
