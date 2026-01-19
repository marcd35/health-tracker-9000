'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from './ColorPicker';
import { NutrientInput } from './NutrientInput';
import type {
  Supplement,
  SupplementFormData,
  NutrientKey,
  DosageFrequency,
} from '@/lib/types/supplements';
import { DEFAULT_SUPPLEMENT_COLOR } from '@/constants/nutrients';

interface NutrientEntry {
  key: NutrientKey | '';
  amount: number;
}

interface SupplementFormProps {
  initialData?: Supplement;
  onSubmit: (data: SupplementFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Helper to convert initialData nutrients to entries
function getInitialNutrients(initialData?: Supplement): NutrientEntry[] {
  if (initialData?.nutrients && Object.keys(initialData.nutrients).length > 0) {
    return Object.entries(initialData.nutrients).map(([key, amount]) => ({
      key: key as NutrientKey,
      amount: amount as number,
    }));
  }
  return [{ key: '', amount: 0 }];
}

export function SupplementForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: SupplementFormProps) {
  // Use useMemo for the initial nutrients to avoid recalculating
  const initialNutrients = useMemo(() => getInitialNutrients(initialData), [initialData]);

  const [name, setName] = useState(initialData?.name || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [servingSize, setServingSize] = useState(initialData?.servingSize || '');
  const [color, setColor] = useState(initialData?.color || DEFAULT_SUPPLEMENT_COLOR);
  const [dosageFrequency, setDosageFrequency] = useState<DosageFrequency>(
    initialData?.dosageFrequency || 'daily'
  );
  const [dosageQuantity, setDosageQuantity] = useState(
    initialData?.dosageQuantity || 1
  );
  const [dosageNotes, setDosageNotes] = useState(initialData?.dosageNotes || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [nutrients, setNutrients] = useState<NutrientEntry[]>(initialNutrients);

  const usedKeys = nutrients
    .map((n) => n.key)
    .filter((k): k is NutrientKey => k !== '');

  const handleAddNutrient = () => {
    setNutrients([...nutrients, { key: '', amount: 0 }]);
  };

  const handleNutrientChange = (index: number, key: NutrientKey) => {
    const updated = [...nutrients];
    updated[index] = { ...updated[index], key };
    setNutrients(updated);
  };

  const handleAmountChange = (index: number, amount: number) => {
    const updated = [...nutrients];
    updated[index] = { ...updated[index], amount };
    setNutrients(updated);
  };

  const handleRemoveNutrient = (index: number) => {
    if (nutrients.length === 1) {
      setNutrients([{ key: '', amount: 0 }]);
    } else {
      setNutrients(nutrients.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert nutrients array to object
    const nutrientsObj: Partial<Record<NutrientKey, number>> = {};
    nutrients.forEach((n) => {
      if (n.key && n.amount > 0) {
        nutrientsObj[n.key] = n.amount;
      }
    });

    onSubmit({
      name,
      brand,
      servingSize,
      color,
      dosageFrequency,
      dosageQuantity,
      dosageNotes,
      nutrients: nutrientsObj,
      notes,
    });
  };

  const isValid = name.trim() && brand.trim() && servingSize.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Vitamin D3"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand *</Label>
          <Input
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., Nature Made"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="servingSize">Serving Size *</Label>
          <Input
            id="servingSize"
            value={servingSize}
            onChange={(e) => setServingSize(e.target.value)}
            placeholder="e.g., 1 softgel"
            required
          />
        </div>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dosageQuantity">Quantity</Label>
          <Input
            id="dosageQuantity"
            type="number"
            min="1"
            max="10"
            value={dosageQuantity}
            onChange={(e) => setDosageQuantity(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dosageFrequency">Frequency</Label>
          <Select
            value={dosageFrequency}
            onValueChange={(val) => setDosageFrequency(val as DosageFrequency)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dosageNotes">Schedule Notes</Label>
          <Input
            id="dosageNotes"
            value={dosageNotes}
            onChange={(e) => setDosageNotes(e.target.value)}
            placeholder="e.g., with food"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Nutrients</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddNutrient}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Nutrient
          </Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {nutrients.map((nutrient, index) => (
            <NutrientInput
              key={index}
              nutrientKey={nutrient.key}
              amount={nutrient.amount}
              usedKeys={usedKeys}
              onNutrientChange={(key) => handleNutrientChange(index, key)}
              onAmountChange={(amount) => handleAmountChange(index, amount)}
              onRemove={() => handleRemoveNutrient(index)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Add Supplement'}
        </Button>
      </div>
    </form>
  );
}
