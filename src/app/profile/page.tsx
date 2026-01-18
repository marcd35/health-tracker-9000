'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { User, ShieldAlert, Heart } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your physical metrics, health conditions, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Physical Metrics</CardTitle>
            </div>
            <CardDescription>Basis for BMR and TDEE calculations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" defaultValue={40} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select defaultValue="male">
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" defaultValue={82} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" defaultValue={178} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity">Activity Level</Label>
              <Select defaultValue="moderate">
                <SelectTrigger id="activity">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light Activity</SelectItem>
                  <SelectItem value="moderate">Moderate Activity</SelectItem>
                  <SelectItem value="active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button className="w-full">Save Metrics</Button>
          </CardFooter>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-orange-500" />
                <CardTitle>Health Conditions</CardTitle>
              </div>
              <CardDescription>Flags and recommendations trigger here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Gout', 'High Blood Pressure'].map((c) => (
                  <div
                    key={c}
                    className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium border border-orange-500/20"
                  >
                    {c}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="rounded-full border-dashed">
                  + Add Condition
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <CardTitle>Allergies</CardTitle>
              </div>
              <CardDescription>Safety checks during meal logging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Shellfish', 'Peanuts'].map((a) => (
                  <div
                    key={a}
                    className="bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium border border-red-500/20"
                  >
                    {a}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="rounded-full border-dashed">
                  + Add Allergy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
