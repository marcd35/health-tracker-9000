'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Database } from 'lucide-react';
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
import { CustomNutrientInput } from './CustomNutrientInput';
import { PercentageCalculator } from './PercentageCalculator';
import { useSupplementStore } from '@/lib/store/supplementStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type {
  Supplement,
  SupplementFormData,
  NutrientKey,
  DosageFrequency,
  SupplementType,
} from '@/lib/types/supplements';
import { DEFAULT_SUPPLEMENT_COLOR } from '@/constants/nutrients';

interface NutrientEntry {
  key: NutrientKey | '';
  amount: number;
}

interface CustomNutrientEntry {
  key: string;
  amount: number;
}

interface DatabaseSuggestion {
  name: string;
  brand: string;
  servingSize: string;
  servingCount: number;
  nutrients: Record<string, number>;
  customNutrients: Record<string, number>;
  notes?: string;
}

interface SupplementFormProps {
  initialData?: Supplement;
  supplementType?: SupplementType;
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

// Helper to convert initialData custom nutrients to entries
function getInitialCustomNutrients(initialData?: Supplement): CustomNutrientEntry[] {
  if (initialData?.customNutrients && Object.keys(initialData.customNutrients).length > 0) {
    return Object.entries(initialData.customNutrients).map(([key, amount]) => ({
      key,
      amount: amount as number,
    }));
  }
  return [];
}

export function SupplementForm({
  initialData,
  supplementType,
  onSubmit,
  onCancel,
  isLoading,
}: SupplementFormProps) {
  const { customNutrientMetadata } = useSupplementStore();

  // Use useMemo for the initial nutrients to avoid recalculating
  const initialNutrients = useMemo(() => getInitialNutrients(initialData), [initialData]);
  const initialCustomNutrients = useMemo(
    () => getInitialCustomNutrients(initialData),
    [initialData]
  );

  // Determine the type - prefer initialData type, then prop, then default to nutrient
  const currentType: SupplementType = initialData?.supplementType || supplementType || 'nutrient';

  const [name, setName] = useState(initialData?.name || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [servingSize, setServingSize] = useState(initialData?.servingSize || '');
  const [color, setColor] = useState(initialData?.color || DEFAULT_SUPPLEMENT_COLOR);
  const [dosageFrequency, setDosageFrequency] = useState<DosageFrequency>(
    initialData?.dosageFrequency || 'daily'
  );
  const [dosageQuantity, setDosageQuantity] = useState(initialData?.dosageQuantity || 1);
  const [dosageNotes, setDosageNotes] = useState(initialData?.dosageNotes || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [nutrients, setNutrients] = useState<NutrientEntry[]>(initialNutrients);
  const [customNutrients, setCustomNutrients] =
    useState<CustomNutrientEntry[]>(initialCustomNutrients);
  const [databaseSuggestion, setDatabaseSuggestion] = useState<DatabaseSuggestion | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (active.data.current?.type === 'nutrient') {
        const oldIndex = nutrients.findIndex(
          (item) => `nutrient-${nutrients.indexOf(item)}` === active.id
        );
        const newIndex = nutrients.findIndex(
          (item) => `nutrient-${nutrients.indexOf(item)}` === over.id
        );
        setNutrients((items) => arrayMove(items, oldIndex, newIndex));
      } else if (active.data.current?.type === 'custom-nutrient') {
        const oldIndex = customNutrients.findIndex(
          (item) => `custom-nutrient-${customNutrients.indexOf(item)}` === active.id
        );
        const newIndex = customNutrients.findIndex(
          (item) => `custom-nutrient-${customNutrients.indexOf(item)}` === over.id
        );
        setCustomNutrients((items) => arrayMove(items, oldIndex, newIndex));
      }
    }
  }

  const usedKeys = nutrients.map((n) => n.key).filter((k): k is NutrientKey => k !== '');

  const usedCustomKeys = customNutrients.map((n) => n.key).filter((k) => k !== '');

  // Debounced database search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!name.trim() && !brand.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDatabaseSuggestion(null);
      return;
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (name.trim()) params.append('name', name);
        if (brand.trim()) params.append('brand', brand);
        params.append('limit', '1');

        const res = await fetch(`/api/supplements/database/search?${params}`);
        if (res.ok) {
          const results = await res.json();
          if (results.length > 0) {
            setDatabaseSuggestion(results[0]);
          } else {
            setDatabaseSuggestion(null);
          }
        }
      } catch (err) {
        console.error('Database search error:', err);
        setDatabaseSuggestion(null);
      }
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [name, brand]);

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

  const handleAddCustomNutrient = () => {
    setCustomNutrients([...customNutrients, { key: '', amount: 0 }]);
  };

  const handleCustomNutrientChange = (index: number, key: string) => {
    const updated = [...customNutrients];
    updated[index] = { ...updated[index], key };
    setCustomNutrients(updated);
  };

  const handleCustomAmountChange = (index: number, amount: number) => {
    const updated = [...customNutrients];
    updated[index] = { ...updated[index], amount };
    setCustomNutrients(updated);
  };

  const handleRemoveCustomNutrient = (index: number) => {
    setCustomNutrients(customNutrients.filter((_, i) => i !== index));
  };

  const handleAutoFill = () => {
    if (!databaseSuggestion) return;

    setServingSize(databaseSuggestion.servingSize);
    setNotes(databaseSuggestion.notes || '');

    // Fill regular nutrients
    const nutrientsObj = databaseSuggestion.nutrients as Record<string, number>;
    if (Object.keys(nutrientsObj).length > 0) {
      const entries: NutrientEntry[] = Object.entries(nutrientsObj).map(([key, amount]) => ({
        key: key as NutrientKey,
        amount,
      }));
      setNutrients(entries.length > 0 ? entries : [{ key: '', amount: 0 }]);
    }

    // Fill custom nutrients
    const customNutrientObj = databaseSuggestion.customNutrients as Record<string, number>;
    if (Object.keys(customNutrientObj).length > 0) {
      const entries: CustomNutrientEntry[] = Object.entries(customNutrientObj).map(
        ([key, amount]) => ({
          key,
          amount,
        })
      );
      setCustomNutrients(entries);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert nutrients array to object
    // For custom supplements, always submit empty nutrients
    const nutrientsObj: Partial<Record<NutrientKey, number>> = {};
    if (currentType === 'nutrient') {
      nutrients.forEach((n) => {
        if (n.key && n.amount > 0) {
          nutrientsObj[n.key] = n.amount;
        }
      });
    }

    // Convert custom nutrients array to object
    const customNutrientObj: Record<string, number> = {};
    customNutrients.forEach((n) => {
      if (n.key && n.amount > 0) {
        customNutrientObj[n.key] = n.amount;
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
      customNutrients: customNutrientObj,
      notes,
      supplementType: currentType,
    });
  };

  const isValid = name.trim() && brand.trim() && servingSize.trim();

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <form onSubmit={handleSubmit} className="grid grid-cols-[2fr_1fr] gap-6 h-full">
        <div className="border-r pr-3 flex flex-col">
          <div className="mb-3">
            <Label>Nutrients</Label>
          </div>
          {currentType === 'nutrient' ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2">
                <SortableContext
                  items={nutrients.map((_, index) => `nutrient-${index}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {nutrients.map((nutrient, index) => (
                    <NutrientInput
                      key={index}
                      id={`nutrient-${index}`}
                      nutrientKey={nutrient.key}
                      amount={nutrient.amount}
                      usedKeys={usedKeys}
                      onNutrientChange={(key) => handleNutrientChange(index, key)}
                      onAmountChange={(amount) => handleAmountChange(index, amount)}
                      onRemove={() => handleRemoveNutrient(index)}
                    />
                  ))}
                </SortableContext>
              </div>
              <div className="mt-3 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNutrient}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Nutrient
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                <span className="font-medium">Custom Supplement</span> – Add custom nutrients to
                track items like omega-3s or probiotics. This supplement will appear in your custom
                supplements list.
              </p>
            </div>
          )}

          {currentType === 'custom' && customNutrientMetadata.length > 0 && (
            <div className="flex-1 flex flex-col border-t pt-4 mt-4">
              <div className="mb-3">
                <Label>Custom Nutrients</Label>
              </div>

              {customNutrients.length > 0 && (
                <PercentageCalculator
                  unit={
                    customNutrients[0]
                      ? customNutrientMetadata.find((n) => n.key === customNutrients[0].key)
                          ?.unit || 'mg'
                      : 'mg'
                  }
                  onApply={(value) => {
                    if (customNutrients.length > 0) {
                      const updated = [...customNutrients];
                      updated[0] = { ...updated[0], amount: value };
                      setCustomNutrients(updated);
                    }
                  }}
                />
              )}

              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2">
                  <SortableContext
                    items={customNutrients.map((_, index) => `custom-nutrient-${index}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {customNutrients.map((nutrient, index) => (
                      <CustomNutrientInput
                        key={index}
                        id={`custom-nutrient-${index}`}
                        nutrientKey={nutrient.key}
                        amount={nutrient.amount}
                        availableNutrients={customNutrientMetadata}
                        usedKeys={usedCustomKeys}
                        onNutrientChange={(key) => handleCustomNutrientChange(index, key)}
                        onAmountChange={(amount) => handleCustomAmountChange(index, amount)}
                        onRemove={() => handleRemoveCustomNutrient(index)}
                      />
                    ))}
                  </SortableContext>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomNutrient}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Custom Nutrient
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
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

          {/* Database Suggestion Banner */}
          {databaseSuggestion && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Found in supplement database
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {databaseSuggestion.brand} • {databaseSuggestion.servingSize}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAutoFill}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Auto-fill Values
              </Button>
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={6}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Add Supplement'}
            </Button>
          </div>
        </div>
      </form>
    </DndContext>
  );
}
