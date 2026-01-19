'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NUTRIENTS, VITAMINS, MINERALS } from '@/constants/nutrients';
import type { SupplementNutrientTarget, NutrientKey } from '@/lib/types/supplements';

interface NutrientTargetsEditorProps {
  targets: SupplementNutrientTarget[];
  onUpdate: (nutrientKey: NutrientKey, targetValue: number, useRda: boolean) => void;
  onReset: (nutrientKey: NutrientKey) => void;
}

export function NutrientTargetsEditor({
  targets,
  onUpdate,
  onReset,
}: NutrientTargetsEditorProps) {
  const [editingKey, setEditingKey] = useState<NutrientKey | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const getTarget = (key: NutrientKey) => {
    return targets.find((t) => t.nutrientKey === key);
  };

  const handleStartEdit = (key: NutrientKey) => {
    const target = getTarget(key);
    const value = target && !target.useRda ? target.targetValue : NUTRIENTS[key].rdaDefault;
    setEditingKey(key);
    setEditValue(value.toString());
  };

  const handleSave = (key: NutrientKey) => {
    const value = parseFloat(editValue);
    if (!isNaN(value) && value > 0) {
      const target = getTarget(key);
      onUpdate(key, value, target?.useRda ?? true);
    }
    setEditingKey(null);
    setEditValue('');
  };

  const handleToggleRda = (key: NutrientKey, useRda: boolean) => {
    const target = getTarget(key);
    const currentValue = target?.targetValue ?? NUTRIENTS[key].rdaDefault;
    onUpdate(key, currentValue, useRda);
  };

  const renderNutrientRow = (key: NutrientKey) => {
    const nutrient = NUTRIENTS[key];
    const target = getTarget(key);
    const isUsingRda = target?.useRda ?? true;
    const currentValue = target && !target.useRda ? target.targetValue : nutrient.rdaDefault;
    const isEditing = editingKey === key;
    const hasCustomTarget = target && !target.useRda;

    return (
      <TableRow key={key}>
        <TableCell className="font-medium">{nutrient.name}</TableCell>
        <TableCell className="text-center text-muted-foreground">
          {nutrient.rdaDefault} {nutrient.unit}
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Switch
              checked={!isUsingRda}
              onCheckedChange={(checked) => handleToggleRda(key, !checked)}
            />
            <Label className="text-xs text-muted-foreground">Custom</Label>
          </div>
        </TableCell>
        <TableCell>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-24 h-8"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(key);
                  if (e.key === 'Escape') setEditingKey(null);
                }}
              />
              <span className="text-xs text-muted-foreground">{nutrient.unit}</span>
              <Button size="sm" variant="secondary" onClick={() => handleSave(key)}>
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartEdit(key)}
                className="text-sm hover:underline"
                disabled={isUsingRda}
              >
                {currentValue} {nutrient.unit}
              </button>
              {hasCustomTarget && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onReset(key)}
                  title="Reset to RDA"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vitamins</CardTitle>
          <CardDescription>
            Set custom daily targets or use recommended RDA values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nutrient</TableHead>
                <TableHead className="text-center">RDA</TableHead>
                <TableHead className="text-center">Override</TableHead>
                <TableHead>Your Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VITAMINS.map((v) => renderNutrientRow(v.key))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Minerals</CardTitle>
          <CardDescription>
            Set custom daily targets or use recommended RDA values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nutrient</TableHead>
                <TableHead className="text-center">RDA</TableHead>
                <TableHead className="text-center">Override</TableHead>
                <TableHead>Your Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MINERALS.map((m) => renderNutrientRow(m.key))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
