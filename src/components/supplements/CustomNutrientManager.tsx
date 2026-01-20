'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { useSupplementStore } from '@/lib/store/supplementStore';

interface EditingNutrient {
  key: string;
  target: number | undefined;
}

export function CustomNutrientManager() {
  const {
    customNutrientMetadata,
    createCustomNutrient,
    updateCustomNutrient,
    deleteCustomNutrient,
  } = useSupplementStore();
  const [editingNutrient, setEditingNutrient] = useState<EditingNutrient | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNutrient, setNewNutrient] = useState({
    key: '',
    name: '',
    unit: 'mg',
    category: 'other',
  });
  const [deleteKey, setDeleteKey] = useState<string | null>(null);

  const handleCreateSubmit = async () => {
    if (!newNutrient.key || !newNutrient.name) {
      return;
    }

    await createCustomNutrient({
      key: newNutrient.key,
      name: newNutrient.name,
      unit: newNutrient.unit,
      category: newNutrient.category,
    });

    setNewNutrient({
      key: '',
      name: '',
      unit: 'mg',
      category: 'other',
    });
    setIsCreating(false);
  };

  const handleUpdateTarget = async () => {
    if (!editingNutrient) return;

    await updateCustomNutrient(editingNutrient.key, {
      userDefinedTarget: editingNutrient.target,
    });

    setEditingNutrient(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteKey) return;

    await deleteCustomNutrient(deleteKey);
    setDeleteKey(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Custom Nutrients</h3>
        {!isCreating && (
          <Button size="sm" onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Nutrient
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
          <h4 className="font-medium">Create Custom Nutrient</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Key (ID)</label>
              <Input
                type="text"
                value={newNutrient.key}
                onChange={(e) =>
                  setNewNutrient({
                    ...newNutrient,
                    key: e.target.value.toLowerCase().replace(/\s+/g, ''),
                  })
                }
                placeholder="e.g., epa"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                type="text"
                value={newNutrient.name}
                onChange={(e) => setNewNutrient({ ...newNutrient, name: e.target.value })}
                placeholder="e.g., EPA (Omega-3)"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <Input
                type="text"
                value={newNutrient.unit}
                onChange={(e) => setNewNutrient({ ...newNutrient, unit: e.target.value })}
                placeholder="e.g., mg"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                type="text"
                value={newNutrient.category}
                onChange={(e) => setNewNutrient({ ...newNutrient, category: e.target.value })}
                placeholder="e.g., omega3"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateSubmit}
              disabled={!newNutrient.key || !newNutrient.name}
            >
              Create
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {customNutrientMetadata.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No custom nutrients yet. Create one to get started!
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Daily Target</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customNutrientMetadata.map((nutrient) => (
              <TableRow key={nutrient.key}>
                <TableCell className="font-medium">{nutrient.name}</TableCell>
                <TableCell>{nutrient.unit}</TableCell>
                <TableCell className="capitalize text-sm text-muted-foreground">
                  {nutrient.category}
                </TableCell>
                <TableCell>
                  {editingNutrient?.key === nutrient.key ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={editingNutrient.target || ''}
                        onChange={(e) =>
                          setEditingNutrient({
                            ...editingNutrient,
                            target: parseFloat(e.target.value) || undefined,
                          })
                        }
                        className="w-24 h-8"
                        placeholder="Not set"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={handleUpdateTarget}
                      >
                        ✓
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => setEditingNutrient(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>
                        {nutrient.userDefinedTarget
                          ? `${nutrient.userDefinedTarget} ${nutrient.unit}`
                          : 'Not set'}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() =>
                          setEditingNutrient({
                            key: nutrient.key,
                            target: nutrient.userDefinedTarget,
                          })
                        }
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteKey(nutrient.key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!deleteKey} onOpenChange={(open) => !open && setDeleteKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Nutrient?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the nutrient and it will no longer appear in supplements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
