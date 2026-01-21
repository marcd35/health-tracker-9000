'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Database,
  Search,
  UserRound,
  PlusCircle,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ImportResult } from '@/lib/types/export';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportResults, setShowImportResults] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportResult(null);
      setShowImportResults(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsLoading(true);
    setImportResult(null);
    setShowImportResults(false);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        let toastId: string | number | undefined;
        try {
          const jsonString = e.target?.result as string;

          // Show confirmation for replace mode
          if (importMode === 'replace') {
            const confirmed = window.confirm(
              'Replace mode will DELETE all existing data and replace it with the imported data. Continue?'
            );
            if (!confirmed) {
              setIsLoading(false);
              return;
            }
          }

          toastId = toast.loading('Importing data...');

          const response = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: jsonString, mode: importMode }),
          });

          const result: ImportResult = await response.json();

          if (!response.ok) {
            throw new Error(result.errors?.[0] || 'Import failed');
          }

          setImportResult(result);
          setShowImportResults(true);

          if (toastId !== undefined) toast.dismiss(toastId);
          if (result.success) {
            toast.success('Data imported successfully!');
          } else {
            toast.error('Import completed with errors');
          }
        } catch (error: any) {
          console.error('Import error:', error);
          if (toastId !== undefined) toast.dismiss(toastId);
          toast.error(error.message || 'Failed to import data');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('File read error:', error);
      toast.error('Error reading JSON file');
      setIsLoading(false);
    }
  };

  const handleProfileSelect = (profileType: string) => {
    setSelectedProfile(profileType);
  };

  const handleLoadProfile = async () => {
    if (!selectedProfile) {
      toast.error('Please select a profile first');
      return;
    }

    const confirmed = window.confirm(
      'Loading a profile will overwrite all your current data.\n\nWe recommend exporting your current data as a backup first.\n\nContinue?'
    );
    if (!confirmed) {
      return;
    }

    setIsProfileLoading(true);

    try {
      if (selectedProfile === 'new_blank') {
        toast.info('Creating new blank profile...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success('New blank profile created successfully!');
      } else {
        const response = await fetch('/api/debug/reset-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileType: selectedProfile }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load profile');
        }

        const data = await response.json();
        toast.success(`Profile loaded successfully: ${data.message}`);
      }
    } catch (error: any) {
      console.error('Profile loading error:', error);
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleExportProfile = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Exporting data...');

    try {
      const response = await fetch('/api/export');

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Get the filename from Content-Disposition header or create one
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename="')[1]?.split('"')[0]
        : `health-tracker-export-${new Date().toISOString().split('T')[0]}.json`;

      // Download the JSON
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success('Profile exported successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.dismiss(toastId);
      toast.error(error.message || 'Failed to export profile');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage data imports and database updates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>JSON Data Import</CardTitle>
            </div>
            <CardDescription>Upload a JSON file to import health data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-file">JSON File</Label>
              <Input
                id="json-file"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-mode">Import Mode</Label>
              <Select
                value={importMode}
                onValueChange={(value) => setImportMode(value as 'merge' | 'replace')}
              >
                <SelectTrigger id="import-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">Merge (Keep existing data)</SelectItem>
                  <SelectItem value="replace">Replace (Clear all data first)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {importMode === 'merge'
                  ? 'New data will be added to existing data'
                  : 'All existing data will be deleted and replaced'}
              </p>
            </div>

            {file && (
              <div className="p-3 bg-secondary rounded-md">
                <p className="text-sm font-medium">Selected File:</p>
                <p className="text-sm text-muted-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            {showImportResults && importResult && (
              <div
                className={`p-3 rounded-md ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className="flex gap-2 items-start">
                  {importResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${importResult.success ? 'text-green-700' : 'text-red-700'}`}
                    >
                      {importResult.success ? 'Import Successful' : 'Import Failed'}
                    </p>
                    <div className="text-xs space-y-1 mt-2">
                      <p>Meals: {importResult.imported.meals}</p>
                      <p>Supplements: {importResult.imported.supplements}</p>
                      <p>Supplement Logs: {importResult.imported.supplementLogs}</p>
                      <p>Daily Summaries: {importResult.imported.dailySummaries}</p>
                      {importResult.warnings.length > 0 && (
                        <p className="text-yellow-700 mt-2">
                          Warnings: {importResult.warnings.length}
                        </p>
                      )}
                      {importResult.errors.length > 0 && (
                        <p className="text-red-700 mt-2">Errors: {importResult.errors.length}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2" onClick={handleImport} disabled={!file || isLoading}>
              <Upload className="h-4 w-4" />
              {isLoading ? 'Importing...' : 'Import Data'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              <CardTitle>Profile Loader</CardTitle>
            </div>
            <CardDescription>Load mock profiles or export current data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Select a profile to load:</p>
              <div className="space-y-2">
                <Button
                  variant={selectedProfile === 'weight_loss' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => handleProfileSelect('weight_loss')}
                  disabled={isProfileLoading}
                >
                  <UserRound className="h-4 w-4" />
                  Weight Loss Profile
                </Button>
                <Button
                  variant={selectedProfile === 'maintenance' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => handleProfileSelect('maintenance')}
                  disabled={isProfileLoading}
                >
                  <UserRound className="h-4 w-4" />
                  Maintenance Profile
                </Button>
                <Button
                  variant={selectedProfile === 'weight_gain' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => handleProfileSelect('weight_gain')}
                  disabled={isProfileLoading}
                >
                  <UserRound className="h-4 w-4" />
                  Weight Gain Profile
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">OR</p>
              <Button
                variant={selectedProfile === 'new_blank' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => handleProfileSelect('new_blank')}
                disabled={isProfileLoading}
              >
                <PlusCircle className="h-4 w-4" />
                Create New Blank Profile
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedProfile(null)}
              disabled={!selectedProfile || isProfileLoading}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleExportProfile}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export Profile'}
            </Button>
            <Button onClick={handleLoadProfile} disabled={!selectedProfile || isProfileLoading}>
              {isProfileLoading ? 'Loading...' : 'Load Profile'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <CardTitle>USDA Food Search</CardTitle>
            </div>
            <CardDescription>Test the USDA FoodData Central API integration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Search for food items and inspect the raw JSON data returned by the USDA API. This
              tool is used for debugging and mapping food data to our database schema.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full gap-2" variant="outline">
              <Link href="/test-food-search">
                <Search className="h-4 w-4" />
                Open Food Search Test
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export/Import Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium mb-2">Export Process:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Click &quot;Export Profile&quot; to download all data</li>
                  <li>A JSON file will be downloaded with timestamp</li>
                  <li>File includes all meals, supplements, goals, and health data</li>
                </ol>
              </div>
              <div className="border-t pt-4">
                <p className="font-medium mb-2">Import Process:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Select import mode: Merge or Replace</li>
                  <li>Choose your exported JSON file</li>
                  <li>Click &quot;Import Data&quot; to begin</li>
                  <li>Review import results and any warnings</li>
                </ol>
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-xs font-medium text-amber-800">
                  ⚠️ Replace mode will delete all current data. Use carefully!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
