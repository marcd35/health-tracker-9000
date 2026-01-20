'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PercentageCalculatorProps {
  unit: string;
  onApply: (value: number) => void;
}

export function PercentageCalculator({ unit, onApply }: PercentageCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [minPercent, setMinPercent] = useState<number>(0);
  const [maxPercent, setMaxPercent] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    if (baseAmount <= 0 || minPercent < 0 || maxPercent < 0 || maxPercent < minPercent) {
      return;
    }

    const midpoint = (minPercent + maxPercent) / 2;
    const calculated = (midpoint / 100) * baseAmount;
    setResult(calculated);
  };

  const handleApply = () => {
    if (result !== null) {
      onApply(result);
      setIsOpen(false);
      // Reset form
      setBaseAmount(0);
      setMinPercent(0);
      setMaxPercent(0);
      setResult(null);
    }
  };

  return (
    <div className="mb-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span>Percentage Calculator</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card className="mt-2 bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Calculate Amount from Percentage</CardTitle>
            <CardDescription>
              Enter base amount and percentage range to calculate the midpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Base Amount ({unit})</label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={baseAmount || ''}
                onChange={(e) => setBaseAmount(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 600"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Min %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={minPercent || ''}
                  onChange={(e) => setMinPercent(parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 45"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={maxPercent || ''}
                  onChange={(e) => setMaxPercent(parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 67"
                  className="mt-1"
                />
              </div>
            </div>

            {result !== null && (
              <div className="p-3 bg-primary/10 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Midpoint of {minPercent}% - {maxPercent}% ={' '}
                  {((minPercent + maxPercent) / 2).toFixed(1)}%
                </p>
                <p className="text-lg font-semibold">
                  Result: {result.toFixed(2)} {unit}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={handleCalculate} className="flex-1">
                Calculate
              </Button>
              {result !== null && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  variant="default"
                  className="flex-1"
                >
                  Use This Value
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
