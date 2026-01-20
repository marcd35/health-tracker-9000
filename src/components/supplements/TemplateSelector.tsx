'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Sparkles, Pill } from 'lucide-react';
import { SUPPLEMENT_TEMPLATES, CUSTOM_SUPPLEMENT_TEMPLATES } from '@/constants/nutrients';
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
      customNutrients: {},
      notes: template.description,
      supplementType: template.supplementType,
    });
  };

  return (
    <Tabs defaultValue="nutrient" className="space-y-4">
      <TabsList>
        <TabsTrigger value="nutrient" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Vitamin/Mineral
        </TabsTrigger>
        <TabsTrigger value="custom" className="gap-2">
          <Pill className="h-4 w-4" />
          Custom
        </TabsTrigger>
      </TabsList>

      <TabsContent value="nutrient" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUPPLEMENT_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} onSelect={handleSelect} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="custom" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CUSTOM_SUPPLEMENT_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} onSelect={handleSelect} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: SupplementTemplate;
  onSelect: (template: SupplementTemplate) => void;
}) {
  return (
    <Card
      className="relative overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
      onClick={() => onSelect(template)}
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
        <CardDescription className="text-xs">{template.description}</CardDescription>
        <div className="mt-2 text-xs text-muted-foreground">
          {template.defaultServingSize}
          {Object.keys(template.nutrients).length > 0 && (
            <span> • {Object.keys(template.nutrients).length} nutrients</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
