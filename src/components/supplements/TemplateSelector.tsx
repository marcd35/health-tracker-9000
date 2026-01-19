'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SUPPLEMENT_TEMPLATES } from '@/constants/nutrients';
import type { SupplementTemplate, SupplementFormData } from '@/lib/types/supplements';

interface TemplateSelectorProps {
  onSelect: (data: SupplementFormData) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const handleSelect = (template: SupplementTemplate) => {
    onSelect({
      name: template.name,
      brand: template.defaultBrand || '',
      servingSize: template.defaultServingSize,
      color: template.suggestedColor,
      dosageFrequency: 'daily',
      dosageQuantity: 1,
      dosageNotes: '',
      nutrients: template.nutrients,
      notes: template.description,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {SUPPLEMENT_TEMPLATES.map((template) => (
        <Card
          key={template.id}
          className="relative overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
          onClick={() => handleSelect(template)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: template.suggestedColor }}
          />
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: template.suggestedColor }}
                />
                <CardTitle className="text-base">{template.name}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              {template.description}
            </CardDescription>
            <div className="mt-2 text-xs text-muted-foreground">
              {template.defaultServingSize}
              {Object.keys(template.nutrients).length > 0 && (
                <span> • {Object.keys(template.nutrients).length} nutrients</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
