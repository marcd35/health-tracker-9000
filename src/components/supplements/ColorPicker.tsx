'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { PRESET_COLORS } from '@/constants/nutrients';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (/^#[0-9a-fA-F]{6}$/.test(color)) {
      onChange(color);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Color</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            type="button"
          >
            <div
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: value }}
            />
            <span className="text-muted-foreground">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-3">
            <div className="grid grid-cols-8 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'h-6 w-6 rounded-md border-2 transition-all hover:scale-110',
                    value === color
                      ? 'border-foreground'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-md border border-border"
                style={{ backgroundColor: customColor }}
              />
              <Input
                type="text"
                value={customColor}
                onChange={handleCustomChange}
                placeholder="#6366f1"
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
