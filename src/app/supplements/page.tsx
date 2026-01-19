'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pill, History, FileJson, Settings, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupplementStore } from '@/lib/store/supplementStore';
import { SupplementCard } from '@/components/supplements/SupplementCard';
import { SupplementDialog } from '@/components/supplements/SupplementDialog';
import { SupplementLogItem } from '@/components/supplements/SupplementLogItem';
import { EditLogDialog } from '@/components/supplements/EditLogDialog';
import { NutrientProgressGrid } from '@/components/supplements/NutrientProgressGrid';
import { TemplateSelector } from '@/components/supplements/TemplateSelector';
import { JSONImportDialog } from '@/components/supplements/JSONImportDialog';
import { NutrientTargetsEditor } from '@/components/supplements/NutrientTargetsEditor';
import { SupplementsSkeleton } from '@/components/supplements/SupplementsSkeleton';
import { ViewSupplementModal } from '@/components/supplements/ViewSupplementModal';
import { TakeEarlierDialog } from '@/components/supplements/TakeEarlierDialog';
import { DuplicateWarningDialog } from '@/components/supplements/DuplicateWarningDialog';
import { DRVReferenceTable } from '@/components/supplements/DRVReferenceTable';
import type { Supplement, SupplementFormData, SupplementLog } from '@/lib/types/supplements';
import type { UserProfile } from '@/lib/types/health';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SupplementsPage() {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const {
    supplements,
    todayLogs,
    nutrientTargets,
    isLoading,
    fetchSupplements,
    fetchTodayLogs,
    fetchNutrientTargets,
    createSupplement,
    updateSupplement,
    deleteSupplement,
    logSupplementTaken,
    checkDuplicateLog,
    updateLog,
    deleteLog,
    updateNutrientTarget,
    deleteNutrientTarget,
    calculateNutrientProgress,
  } = useSupplementStore();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | undefined>();
  const [editingLog, setEditingLog] = useState<SupplementLog | null>(null);
  const [deletingSupplementId, setDeletingSupplementId] = useState<string | null>(null);
  const [viewingSupplement, setViewingSupplement] = useState<Supplement | null>(null);
  const [takeEarlierSupplement, setTakeEarlierSupplement] = useState<Supplement | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    supplement: Supplement;
    existingLogs: SupplementLog[];
  } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      fetchSupplements();
      fetchTodayLogs(today);
      fetchNutrientTargets();

      // Fetch profile
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchData();
  }, [fetchSupplements, fetchTodayLogs, fetchNutrientTargets, today]);

  // Calculate taken counts per supplement
  const takenCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    todayLogs.forEach((log) => {
      if (log.taken) {
        counts[log.supplementId] = (counts[log.supplementId] || 0) + 1;
      }
    });
    return counts;
  }, [todayLogs]);

  // Calculate nutrient progress
  const nutrientProgress = useMemo(
    () => calculateNutrientProgress(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayLogs, supplements, nutrientTargets]
  );

  // Handlers
  const handleCreateSupplement = async (data: SupplementFormData) => {
    await createSupplement(data);
    setIsFormOpen(false);
    setEditingSupplement(undefined);
  };

  const handleUpdateSupplement = async (data: SupplementFormData) => {
    if (editingSupplement) {
      await updateSupplement(editingSupplement.id, data);
      setIsFormOpen(false);
      setEditingSupplement(undefined);
    }
  };

  const handleDeleteSupplement = async () => {
    if (deletingSupplementId) {
      await deleteSupplement(deletingSupplementId);
      setDeletingSupplementId(null);
    }
  };

  const handleTake = async (supplement: Supplement) => {
    const isDuplicate = checkDuplicateLog(supplement.id, today);

    if (isDuplicate) {
      const logs = todayLogs.filter((l) => l.supplementId === supplement.id && l.taken);
      setDuplicateWarning({ supplement, existingLogs: logs });
    } else {
      await logSupplementTaken(supplement.id, supplement.name, today);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (duplicateWarning) {
      await logSupplementTaken(
        duplicateWarning.supplement.id,
        duplicateWarning.supplement.name,
        today,
        undefined,
        true
      );
      setDuplicateWarning(null);
    }
  };

  const handleTakeEarlier = async (supplement: Supplement, date: string, time: string) => {
    const takenAt = `${date}T${time}:00`;
    const isDuplicate = checkDuplicateLog(supplement.id, date);
    await logSupplementTaken(supplement.id, supplement.name, date, takenAt, isDuplicate);
    setTakeEarlierSupplement(null);
  };

  const handleEditLog = async (logId: string, takenAt: string) => {
    await updateLog(logId, takenAt, today);
  };

  const handleDeleteLog = async (logId: string) => {
    await deleteLog(logId, today);
  };

  const handleImport = async (importedSupplements: SupplementFormData[]) => {
    for (const data of importedSupplements) {
      await createSupplement(data);
    }
  };

  const handleTemplateSelect = (data: SupplementFormData) => {
    setEditingSupplement(undefined);
    setIsFormOpen(true);
    // Small delay to ensure dialog opens first
    setTimeout(() => {
      const formEvent = new CustomEvent('template-selected', { detail: data });
      window.dispatchEvent(formEvent);
    }, 100);
  };

  const handleNutrientTargetUpdate = async (
    nutrientKey: Parameters<typeof updateNutrientTarget>[0],
    targetValue: number,
    useRda: boolean
  ) => {
    await updateNutrientTarget(nutrientKey, targetValue, useRda);
  };

  const handleNutrientTargetReset = async (
    nutrientKey: Parameters<typeof deleteNutrientTarget>[0]
  ) => {
    await deleteNutrientTarget(nutrientKey, today);
  };

  if (isLoading && supplements.length === 0) {
    return <SupplementsSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplements</h1>
          <p className="text-muted-foreground">
            Manage your daily supplement routine and track nutrient intake.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplement
        </Button>
      </div>

      {/* Main content with tabs */}
      <Tabs defaultValue="stack" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stack" className="gap-2">
            <Pill className="h-4 w-4" />
            My Stack
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Layers className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <FileJson className="h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="targets" className="gap-2">
            <Settings className="h-4 w-4" />
            Targets
          </TabsTrigger>
        </TabsList>

        {/* My Stack Tab */}
        <TabsContent value="stack" className="space-y-6">
          {/* Daily Stack - Full Width at Top */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                <CardTitle>Daily Stack</CardTitle>
              </div>
              <CardDescription>
                Your supplements. Click &quot;Take Now&quot; to log.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supplements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No supplements yet.</p>
                  <p className="text-sm mt-1">
                    Add supplements or choose from templates to get started.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {supplements.map((supplement) => (
                    <SupplementCard
                      key={supplement.id}
                      supplement={supplement}
                      takenCount={takenCounts[supplement.id] || 0}
                      onView={() => setViewingSupplement(supplement)}
                      onTakeEarlier={() => setTakeEarlierSupplement(supplement)}
                      onTake={() => handleTake(supplement)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Grid: Nutrient Progress + DRV Table | Today's Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Nutrient Progress + DRV Table (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Nutrient Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Nutrient Progress</CardTitle>
                  <CardDescription>Daily intake from supplements taken today.</CardDescription>
                </CardHeader>
                <CardContent>
                  <NutrientProgressGrid progressData={nutrientProgress} showEmpty={false} />
                </CardContent>
              </Card>

              {/* DRV Reference Table */}
              <DRVReferenceTable profile={profile} nutrientTargets={nutrientTargets} />
            </div>

            {/* Right: Today's Logs (1 col) */}
            <div className="space-y-6">
              {todayLogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      <CardTitle>Today&apos;s Logs</CardTitle>
                    </div>
                    <CardDescription>Supplements taken today with timestamps.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {todayLogs
                        .filter((log) => log.taken)
                        .map((log) => (
                          <SupplementLogItem
                            key={log.id}
                            log={log}
                            supplement={supplements.find((s) => s.id === log.supplementId)}
                            onEdit={() => setEditingLog(log)}
                            onDelete={() => handleDeleteLog(log.id)}
                          />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Supplement Templates</CardTitle>
              <CardDescription>
                Quick-start with common supplements. Click to add with pre-filled values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateSelector onSelect={handleTemplateSelect} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Supplements</CardTitle>
              <CardDescription>
                Import supplements from a JSON file or paste JSON data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  JSON format supports the following fields: name, brand, servingSize, nutrients
                  (object with nutrient keys), color, dosageFrequency, dosageQuantity, dosageNotes,
                  and notes.
                </p>
                <Button onClick={() => setIsImportOpen(true)}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Open Import Dialog
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targets Tab */}
        <TabsContent value="targets">
          <NutrientTargetsEditor
            targets={nutrientTargets}
            onUpdate={handleNutrientTargetUpdate}
            onReset={handleNutrientTargetReset}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SupplementDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingSupplement(undefined);
        }}
        supplement={editingSupplement}
        onSubmit={editingSupplement ? handleUpdateSupplement : handleCreateSupplement}
        isLoading={isLoading}
      />

      <JSONImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={handleImport}
      />

      <EditLogDialog
        log={editingLog}
        open={!!editingLog}
        onOpenChange={(open) => !open && setEditingLog(null)}
        onSave={handleEditLog}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingSupplementId}
        onOpenChange={(open) => !open && setDeletingSupplementId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this supplement and all its log history. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSupplement}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Supplement Modal */}
      <ViewSupplementModal
        supplement={viewingSupplement}
        open={!!viewingSupplement}
        onClose={() => setViewingSupplement(null)}
        onEdit={(s) => {
          setEditingSupplement(s);
          setIsFormOpen(true);
          setViewingSupplement(null);
        }}
        onDelete={(id) => {
          setDeletingSupplementId(id);
          setViewingSupplement(null);
        }}
      />

      {/* Take Earlier Dialog */}
      <TakeEarlierDialog
        supplement={takeEarlierSupplement}
        open={!!takeEarlierSupplement}
        onClose={() => setTakeEarlierSupplement(null)}
        onSubmit={(date, time) =>
          takeEarlierSupplement && handleTakeEarlier(takeEarlierSupplement, date, time)
        }
      />

      {/* Duplicate Warning Dialog */}
      <DuplicateWarningDialog
        supplementName={duplicateWarning?.supplement.name}
        existingLogs={duplicateWarning?.existingLogs || []}
        open={!!duplicateWarning}
        onConfirm={handleConfirmDuplicate}
        onCancel={() => setDuplicateWarning(null)}
      />
    </div>
  );
}
