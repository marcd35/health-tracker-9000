'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Supplement, NutrientKey } from '@/lib/types/supplements';
import { NUTRIENTS } from '@/constants/nutrients';
import { Edit2, Trash2 } from 'lucide-react';

interface ViewSupplementModalProps {
  supplement: Supplement | null;
  open: boolean;
  onClose: () => void;
  onEdit: (supplement: Supplement) => void;
  onDelete: (id: string) => void;
}

export function ViewSupplementModal({
  supplement,
  open,
  onClose,
  onEdit,
  onDelete,
}: ViewSupplementModalProps) {
  if (!supplement) return null;

  const nutrientEntries = Object.entries(supplement.nutrients).filter(([, value]) => value > 0) as [
    NutrientKey,
    number,
  ][];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{supplement.name}</DialogTitle>
          <DialogDescription>{supplement.brand}</DialogDescription>
        </DialogHeader>

        <div className="space-y-0">
          {/* Color & Basic Info */}
          <div className="flex items-center gap-4 pb-4">
            <div
              className="w-8 h-8 rounded-md border shadow-sm"
              style={{ backgroundColor: supplement.color }}
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Serving Size</p>
              <p className="font-medium">{supplement.servingSize}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Dosage</p>
              <p className="font-medium">
                {supplement.dosageQuantity} {supplement.dosageFrequency}
              </p>
            </div>
          </div>

          {/* Dosage Notes */}
          {supplement.dosageNotes && (
            <>
              <div className="border-t" />
              <div className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground mb-1">Dosage Notes</p>
                <p className="text-sm">{supplement.dosageNotes}</p>
              </div>
            </>
          )}

          {/* Nutrients Table */}
          {nutrientEntries.length > 0 && (
            <>
              <div className="border-t" />
              <div className="pt-4 pb-4">
                <p className="text-sm font-medium mb-2">Nutritional Content</p>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-4 py-2">Nutrient</th>
                        <th className="text-right px-4 py-2">Amount</th>
                        <th className="text-right px-4 py-2">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {nutrientEntries
                        .map(([key, value]) => {
                          const nutrientInfo = NUTRIENTS[key];
                          return nutrientInfo ? (
                            <tr key={key} className="hover:bg-muted/50">
                              <td className="px-4 py-2">{nutrientInfo.name}</td>
                              <td className="px-4 py-2 text-right font-medium">{value}</td>
                              <td className="px-4 py-2 text-right text-muted-foreground">
                                {nutrientInfo.unit}
                              </td>
                            </tr>
                          ) : null;
                        })
                        .filter(Boolean)}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {supplement.notes && (
            <>
              <div className="border-t" />
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{supplement.notes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              onEdit(supplement);
            }}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(supplement.id);
            }}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
