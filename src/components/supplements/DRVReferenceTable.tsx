'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserProfile } from '@/lib/types/health';
import { SupplementNutrientTarget, NutrientKey } from '@/lib/types/supplements';
import { NUTRIENTS } from '@/constants/nutrients';
import { ExternalLink } from 'lucide-react';

interface DRVReferenceTableProps {
  profile: UserProfile | null;
  nutrientTargets: SupplementNutrientTarget[];
}

export function DRVReferenceTable({ profile, nutrientTargets }: DRVReferenceTableProps) {
  // Get the effective target for each nutrient
  const getEffectiveTarget = (nutrientKey: NutrientKey) => {
    const customTarget = nutrientTargets.find((t) => t.nutrientKey === nutrientKey);
    const nutrientInfo = NUTRIENTS[nutrientKey];

    // If custom target exists and not using RDA, use custom value
    if (customTarget && !customTarget.useRda) {
      return customTarget.targetValue;
    }

    // Otherwise use default RDA
    return nutrientInfo.rdaDefault;
  };

  const headerText = profile
    ? `Daily Reference Values (DRV) for ${profile.age} year old ${profile.gender}`
    : 'Daily Reference Values (DRV)';

  const nutrientEntries = Object.entries(NUTRIENTS).map(([key, info]) => ({
    key: key as NutrientKey,
    info,
    target: getEffectiveTarget(key as NutrientKey),
  }));

  // Split into vitamins and minerals for better organization
  const vitamins = nutrientEntries.filter((n) => n.info.category === 'vitamin');
  const minerals = nutrientEntries.filter((n) => n.info.category === 'mineral');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{headerText}</CardTitle>
        <CardDescription>
          Reference values based on FDA guidelines{' '}
          {!profile && '(Configure your profile for personalized values)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Vitamins Section */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Vitamins</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nutrient</TableHead>
                  <TableHead className="text-right">Target Value</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vitamins.map(({ key, info, target }) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{info.name}</TableCell>
                    <TableCell className="text-right">{target}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{info.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Minerals Section */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Minerals</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nutrient</TableHead>
                  <TableHead className="text-right">Target Value</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {minerals.map(({ key, info, target }) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{info.name}</TableCell>
                    <TableCell className="text-right">{target}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{info.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* FDA Reference Link */}
          <div className="pt-2 border-t">
            <a
              href="https://www.fda.gov/media/99069/download"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              FDA Nutrition Facts Label Reference
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
