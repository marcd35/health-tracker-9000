'use client';

import { Sparkles, Pill } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SupplementType } from '@/lib/types/supplements';

interface AddSupplementTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: SupplementType) => void;
}

export function AddSupplementTypeDialog({
  open,
  onOpenChange,
  onSelectType,
}: AddSupplementTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Supplement</DialogTitle>
          <DialogDescription>Choose the type of supplement you want to add</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-4">
          {/* Nutrient Supplement Option */}
          <button
            onClick={() => {
              onSelectType('nutrient');
              onOpenChange(false);
            }}
            className="relative overflow-hidden rounded-lg border-2 border-transparent p-4 text-left transition-all hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Vitamin/Mineral Supplement</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tracked nutrients with FDA daily reference values (vitamins, minerals, etc.)
                </p>
              </div>
            </div>
          </button>

          {/* Custom Supplement Option */}
          <button
            onClick={() => {
              onSelectType('custom');
              onOpenChange(false);
            }}
            className="relative overflow-hidden rounded-lg border-2 border-transparent p-4 text-left transition-all hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
          >
            <div className="flex items-start gap-3">
              <Pill className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Custom Supplement</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Non-tracked supplements (fish oil, CoQ10, probiotics, herbs, etc.)
                </p>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
