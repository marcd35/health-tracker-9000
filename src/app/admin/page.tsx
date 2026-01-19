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
import { Upload, Database } from 'lucide-react';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setIsLoading(true);

    // Placeholder for JSON import functionality
    /*
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const jsonData = JSON.parse(e.target?.result as string);
        // Here you would typically send the data to your API
        // const response = await fetch('/api/admin/import', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(jsonData),
        // });
        // if (response.ok) {
        //   alert('Data imported successfully');
        // } else {
        //   alert('Failed to import data');
        // }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing JSON:', error);
      alert('Error importing JSON file');
    } finally {
      setIsLoading(false);
    }
    */

    // Simulate import process
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert(
      'Import functionality is a placeholder. Check the commented code for implementation details.'
    );
    setIsLoading(false);
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
            <CardDescription>Upload a JSON file to update the database</CardDescription>
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
            {file && (
              <div className="p-3 bg-secondary rounded-md">
                <p className="text-sm font-medium">Selected File:</p>
                <p className="text-sm text-muted-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
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
            <CardTitle>Import Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <ol className="list-decimal list-inside space-y-2">
                <li>Prepare your JSON file with the required data structure</li>
                <li>Click "Choose File" and select your JSON file</li>
                <li>Review the selected file details</li>
                <li>Click "Import Data" to begin the import process</li>
                <li>The system will validate and update the database</li>
              </ol>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-xs font-medium text-blue-600">
                  Note: This is a placeholder implementation. The actual import functionality would
                  involve API calls to update your database. Refer to the commented code in the
                  component for implementation details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
