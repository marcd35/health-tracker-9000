'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Download, Info, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '../common/CopyButton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NUTRIENT_ID_MAP } from '@/lib/services/usda/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FoodInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodName: string;
  rawJson: any;
  onSave?: (manualAllergens: string[]) => void;
}

const BIG_9_ALLERGENS = [
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree Nuts',
  'Peanuts',
  'Wheat',
  'Soy',
  'Sesame',
];

export function FoodInspectionModal({
  isOpen,
  onClose,
  foodName,
  rawJson,
  onSave,
}: FoodInspectionModalProps) {
  // Debug logging
  useEffect(() => {
    console.log('FoodInspectionModal - rawJson:', rawJson);
  }, [rawJson]);

  const [selectedPortionId, setSelectedPortionId] = useState<string>('default');

  const foodPortions = useMemo(() => rawJson?.foodPortions || [], [rawJson]);
  const servingSize = rawJson?.servingSize;
  const servingSizeUnit = rawJson?.servingSizeUnit;
  const ingredients = rawJson?.ingredients;

  // Phase 3: Allergen keywords for highlighting
  const detectedAllergens = useMemo(() => {
    if (!ingredients) return [];
    const allergens: string[] = [];
    const keywords = [
      'milk',
      'egg',
      'fish',
      'shellfish',
      'tree nut',
      'peanut',
      'wheat',
      'soy',
      'sesame',
    ];
    const lowerIngredients = ingredients.toLowerCase();
    keywords.forEach((k) => {
      if (lowerIngredients.includes(k)) allergens.push(k);
    });
    return allergens;
  }, [ingredients]);

  const [manualAllergens, setManualAllergens] = useState<string[]>([]);

  // Initialize manual allergens from detected ones when modal opens or rawJson changes
  useEffect(() => {
    if (isOpen && detectedAllergens.length > 0) {
      // Map detected keywords to Big 9 names if possible, or just keep as is
      const normalized = detectedAllergens.map(d => {
        const found = BIG_9_ALLERGENS.find(b => b.toLowerCase().includes(d.toLowerCase()));
        return found || d;
      });
      setManualAllergens(Array.from(new Set(normalized)));
    } else if (isOpen) {
      setManualAllergens([]);
    }
  }, [isOpen, detectedAllergens]);

  const toggleAllergen = (allergen: string) => {
    setManualAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const selectedPortion = useMemo(() => {
    if (selectedPortionId === 'default') {
      return {
        gramWeight: servingSize || 100,
        label: servingSize
          ? `${servingSize}${servingSizeUnit || 'g'} (Default)`
          : '100g (Standard)',
        isDefault: true,
      };
    }
    const portion = foodPortions.find((p: any) => p.id.toString() === selectedPortionId);
    return {
      gramWeight: portion?.gramWeight || 100,
      label: portion
        ? `${portion.amount ? portion.amount + ' ' : ''}${portion.measureUnitName}${portion.modifier ? ' (' + portion.modifier + ')' : ''}`
        : '100g',
      isDefault: false,
    };
  }, [selectedPortionId, foodPortions, servingSize, servingSizeUnit]);

  const mappedData = useMemo(() => {
    if (!rawJson?.foodNutrients) return [];

    const nutrients = rawJson.foodNutrients;
    const baseWeight = servingSize || 100;
    const scale = selectedPortion.gramWeight / baseWeight;

    return nutrients.map((n: any) => {
      const dbField = NUTRIENT_ID_MAP[n.nutrientId as keyof typeof NUTRIENT_ID_MAP];
      const scaledValue = n.value * scale;

      return {
        id: n.nutrientId,
        usdaName: n.nutrientName,
        dbField: dbField || null,
        originalValue: `${n.value} ${n.unitName}`,
        transformedValue: dbField ? `${scaledValue.toFixed(2)} ${n.unitName}` : null,
        isMapped: !!dbField,
      };
    });
  }, [rawJson, selectedPortion, servingSize]);

  const handleDownload = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rawJson, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute(
      'download',
      `usda-${foodName.toLowerCase().replace(/\s+/g, '-')}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Data Inspection & Mapping
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Reviewing <span className="font-semibold text-foreground">{foodName}</span> (FDC ID:{' '}
                {rawJson?.fdcId})
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2 h-9 px-4 rounded-full border-muted-foreground/20 hover:bg-muted/50 transition-all"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 pt-2 flex flex-col gap-4">
          {!rawJson ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mb-4 text-amber-500/50" />
              <p>No raw USDA data available for this item.</p>
              <p className="text-sm mt-2">This might be a manually added food or data was lost.</p>
            </div>
          ) : (
            <>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                    <strong>Allergen Warning:</strong> USDA does not provide allergen information.
                    Always review ingredients and verify allergen status before logging.
                  </p>
                  {detectedAllergens.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[10px] text-amber-600/70 font-bold uppercase tracking-tight self-center mr-1">
                        Auto-detected keywords:
                      </span>
                      {detectedAllergens.map((a, i) => (
                        <Badge
                          key={`${a}-${i}`}
                          variant="outline"
                          className="bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] uppercase font-bold px-2 py-0"
                        >
                          {a}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {/* [PHASE 4: Manual Allergen Flagging]
                      Future: Add a checklist of allergens for user to manually verify and save. 
                  */}
                  <div className="pt-4 border-t border-amber-500/10 space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700/70 dark:text-amber-400/70">
                      Manual Allergen Checklist
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {BIG_9_ALLERGENS.map((allergen) => (
                        <div key={allergen} className="flex items-center space-x-2">
                          <Checkbox
                            id={`allergen-${allergen}`}
                            checked={manualAllergens.includes(allergen)}
                            onCheckedChange={() => toggleAllergen(allergen)}
                            className="border-amber-500/30 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white"
                          />
                          <label
                            htmlFor={`allergen-${allergen}`}
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-amber-900/80 dark:text-amber-100/80 cursor-pointer"
                          >
                            {allergen}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* [PHASE 4: Edge Case Lookup Surface] */}
              {rawJson?.ingredients?.toLowerCase().includes('syrup') && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-4">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                      Edge Case: Potential High-Fructose Corn Syrup
                    </p>
                    <p className="text-[11px] text-blue-600/70 dark:text-blue-300/70">
                      Detected 'syrup' in ingredients. Review for HFCS if sensitive.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Serving Size
                  </label>
                  <Select value={selectedPortionId} onValueChange={setSelectedPortionId}>
                    <SelectTrigger className="w-full rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-primary/20 transition-all">
                      <SelectValue placeholder="Select portion" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-muted-foreground/10 shadow-xl">
                      <SelectItem value="default" className="rounded-lg">
                        {servingSize
                          ? `${servingSize}${servingSizeUnit || 'g'} (Serving)`
                          : '100g (Standard)'}
                      </SelectItem>
                      {foodPortions.map((portion: any, i: number) => (
                        <SelectItem
                          key={`${portion.id}-${i}`}
                          value={portion.id.toString()}
                          className="rounded-lg"
                        >
                          {portion.amount ? portion.amount + ' ' : ''}
                          {portion.measureUnitName}
                          {portion.modifier ? ' (' + portion.modifier + ')' : ''} (
                          {portion.gramWeight}g)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex items-center justify-end">
                  <div className="bg-primary/5 rounded-xl border border-primary/10 p-3 flex items-center gap-3">
                    <Info className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">
                      Nutrients are currently scaled to{' '}
                      <span className="font-bold text-foreground">
                        {parseFloat(selectedPortion.gramWeight.toFixed(4))}g
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
                  <TabsTrigger value="preview" className="rounded-lg">
                    Data Mapping Preview
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="rounded-lg">
                    Raw JSON Response
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="preview"
                  className="flex-1 overflow-hidden mt-4 border rounded-xl border-muted-foreground/10 bg-muted/20 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <ScrollArea className="max-h-[300px] overflow-auto">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow>
                          <TableHead className="w-[40%]">USDA Field</TableHead>
                          <TableHead className="w-[20%]">DB Column</TableHead>
                          <TableHead className="text-right">Transformed Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mappedData.map((item: any, i: number) => (
                          <TableRow
                            key={`${item.id}-${i}`}
                            className={
                              item.isMapped
                                ? 'hover:bg-primary/5 transition-colors'
                                : 'opacity-40 hover:bg-muted/30 grayscale'
                            }
                          >
                            <TableCell className="font-medium text-xs">
                              {item.usdaName}
                              {item.isMapped && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-[8px] h-4 bg-primary/10 text-primary border-none"
                                >
                                  Mapped
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-[10px] text-muted-foreground">
                              {item.dbField ? (
                                <div className="flex items-center gap-1">
                                  <ChevronRight className="h-3 w-3" />
                                  {item.dbField}
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-xs transition-all pr-2">
                              {item.transformedValue || item.originalValue}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="raw"
                  className="flex-1 overflow-hidden mt-4 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <div className="relative group rounded-xl border border-muted-foreground/10 bg-muted/30 overflow-hidden flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-muted-foreground/10 bg-muted/50">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono tracking-widest uppercase opacity-70"
                      >
                        RAW_USDA_RESPONSE.JSON
                      </Badge>
                      <CopyButton value={JSON.stringify(rawJson, null, 2)} />
                    </div>
                    <ScrollArea className="max-h-[300px] overflow-auto font-mono text-xs">
                      <pre className="p-4 leading-relaxed">{JSON.stringify(rawJson, null, 2)}</pre>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        <div className="p-6 border-t border-muted-foreground/10 bg-muted/20 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-full px-6 h-10 font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave?.(manualAllergens);
              onClose();
            }}
            variant="default"
            className="rounded-full px-8 h-10 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
          >
            {onSave ? 'Confirm & Apply' : 'Done'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
