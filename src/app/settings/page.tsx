'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHealthStore } from '@/lib/store/healthStore';
import { useSupplementStore } from '@/lib/store/supplementStore';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function SettingsPage() {
  const { preferences, updatePreferences } = useHealthStore();
  const { supplements } = useSupplementStore();

  const [localSettings, setLocalSettings] = useState({
    timezone: preferences?.timezone || 'UTC',
    showClock: preferences?.showClock ?? true,
    showHealthInsights: preferences?.showHealthInsights ?? false,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalSettings({
        timezone: preferences.timezone,
        showClock: preferences.showClock,
        showHealthInsights: preferences.showHealthInsights,
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences(localSettings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      {/* Display & Interface Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display & Interface</CardTitle>
          <CardDescription>Customize how the app appears and behaves</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={localSettings.timezone} onValueChange={(value) => setLocalSettings({ ...localSettings, timezone: value })}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used for displaying time and resetting daily data</p>
          </div>

          {/* Clock Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Clock</Label>
              <p className="text-xs text-muted-foreground">Display current date and time in header</p>
            </div>
            <Switch
              checked={localSettings.showClock}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showClock: checked })}
            />
          </div>

          {/* Health Insights Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Health Insights</Label>
              <p className="text-xs text-muted-foreground">Show personalized recommendations on dashboard</p>
            </div>
            <Switch
              checked={localSettings.showHealthInsights}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showHealthInsights: checked })}
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Habit Management */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Management</CardTitle>
          <CardDescription>Enable or disable supplements to affect health score calculation</CardDescription>
        </CardHeader>
        <CardContent>
          {supplements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No supplements yet. Add some to manage them here.</p>
          ) : (
            <div className="space-y-3">
              {supplements.map((supp) => (
                <div key={supp.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{supp.name}</p>
                    <p className="text-xs text-muted-foreground">{supp.brand}</p>
                  </div>
                  <Switch
                    checked={supp.enabled}
                    onCheckedChange={async (checked) => {
                      const { toggleSupplementEnabled } = useSupplementStore.getState();
                      await toggleSupplementEnabled(supp.id, checked);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
