'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SupplementFormData, NutrientKey } from '@/lib/types/supplements';
import { NUTRIENT_KEYS } from '@/constants/nutrients';

interface JSONImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (supplements: SupplementFormData[]) => void;
}

interface ParsedSupplement {
  name: string;
  brand: string;
  servingSize: string;
  nutrients?: Record<string, number>;
  customNutrients?: Record<string, number>;
  notes?: string;
  color?: string;
  dosageFrequency?: 'daily' | 'weekly';
  dosageQuantity?: number;
  dosageNotes?: string;
  supplementType?: 'nutrient' | 'custom';
}

export function JSONImportDialog({ open, onOpenChange, onImport }: JSONImportDialogProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<SupplementFormData[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndParse = (text: string): SupplementFormData[] | null => {
    try {
      const parsed = JSON.parse(text);
      const supplements = Array.isArray(parsed) ? parsed : [parsed];

      const validated: SupplementFormData[] = supplements.map(
        (item: ParsedSupplement, index: number) => {
          if (!item.name || typeof item.name !== 'string') {
            throw new Error(`Item ${index + 1}: "name" is required`);
          }
          if (!item.brand || typeof item.brand !== 'string') {
            throw new Error(`Item ${index + 1}: "brand" is required`);
          }
          if (!item.servingSize || typeof item.servingSize !== 'string') {
            throw new Error(`Item ${index + 1}: "servingSize" is required`);
          }

          // Validate and filter nutrients
          const validNutrients: Partial<Record<NutrientKey, number>> = {};
          if (item.nutrients && typeof item.nutrients === 'object') {
            Object.entries(item.nutrients).forEach(([key, value]) => {
              if (NUTRIENT_KEYS.includes(key as NutrientKey) && typeof value === 'number') {
                validNutrients[key as NutrientKey] = value;
              }
            });
          }

          return {
            name: item.name,
            brand: item.brand,
            servingSize: item.servingSize,
            nutrients: validNutrients,
            customNutrients: item.customNutrients || {},
            notes: item.notes || '',
            color: item.color || '#6366f1',
            dosageFrequency: item.dosageFrequency || 'daily',
            dosageQuantity: item.dosageQuantity || 1,
            dosageNotes: item.dosageNotes || '',
            supplementType: item.supplementType || 'nutrient',
          };
        }
      );

      return validated;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Invalid JSON format');
    }
  };

  const handleParse = () => {
    setError(null);
    setParsedData(null);

    if (!jsonText.trim()) {
      setError('Please enter or paste JSON data');
      return;
    }

    try {
      const data = validateAndParse(jsonText);
      setParsedData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      setError(null);
      setParsedData(null);

      try {
        const data = validateAndParse(text);
        setParsedData(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedData) {
      onImport(parsedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setJsonText('');
    setError(null);
    setParsedData(null);
    onOpenChange(false);
  };

  const exampleJson = `[
  {
    "name": "Vitamin D3",
    "brand": "Nature Made",
    "servingSize": "1 softgel",
    "nutrients": {
      "vitaminD": 50
    },
    "color": "#f59e0b",
    "dosageFrequency": "daily",
    "dosageQuantity": 1,
    "dosageNotes": "with breakfast"
  }
]`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Supplements</DialogTitle>
          <DialogDescription>
            Import supplements from a JSON file or paste JSON directly.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="paste" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">
              <FileText className="h-4 w-4 mr-2" />
              Paste JSON
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4">
            <Textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError(null);
                setParsedData(null);
              }}
              placeholder={exampleJson}
              rows={10}
              className="font-mono text-sm"
            />
            <Button onClick={handleParse} variant="secondary" className="w-full">
              Parse JSON
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">JSON files only</p>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {parsedData && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Found {parsedData.length} supplement{parsedData.length !== 1 ? 's' : ''} ready to
              import:
              <ul className="mt-2 list-disc list-inside text-sm">
                {parsedData.map((s, i) => (
                  <li key={i}>
                    {s.name} ({s.brand})
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!parsedData}>
            Import {parsedData?.length || 0} Supplement
            {parsedData?.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
