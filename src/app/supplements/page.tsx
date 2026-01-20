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
import { TemplateSelector } from '@/components/supplements/TemplateSelector';
import { JSONImportDialog } from '@/components/supplements/JSONImportDialog';
import { NutrientTargetsEditor } from '@/components/supplements/NutrientTargetsEditor';
import { SupplementsSkeleton } from '@/components/supplements/SupplementsSkeleton';
import { ViewSupplementModal } from '@/components/supplements/ViewSupplementModal';
import { TakeEarlierDialog } from '@/components/supplements/TakeEarlierDialog';
import { DuplicateWarningDialog } from '@/components/supplements/DuplicateWarningDialog';
import { VitaminProgressCard } from '@/components/supplements/VitaminProgressCard';
import { MineralProgressCard } from '@/components/supplements/MineralProgressCard';
import { CustomSupplementsCard } from '@/components/supplements/CustomSupplementsCard';
import { CustomNutrientManager } from '@/components/supplements/CustomNutrientManager';
import { AddSupplementTypeDialog } from '@/components/supplements/AddSupplementTypeDialog';
import type {
  Supplement,
  SupplementFormData,
  SupplementLog,
  SupplementType,
} from '@/lib/types/supplements';
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
    customNutrientMetadata,
    isLoading,
    fetchSupplements,
    fetchTodayLogs,
    fetchNutrientTargets,
    fetchCustomNutrients,
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
    calculateCustomNutrientProgress,
    getCustomSupplements,
  } = useSupplementStore();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [selectedSupplementType, setSelectedSupplementType] = useState<SupplementType | null>(null);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | undefined>();
  const [editingLog, setEditingLog] = useState<SupplementLog | null>(null);
  const [deletingSupplementId, setDeletingSupplementId] = useState<string | null>(null);
  const [viewingSupplement, setViewingSupplement] = useState<Supplement | null>(null);
  const [takeEarlierSupplement, setTakeEarlierSupplement] = useState<Supplement | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    supplement: Supplement;
    existingLogs: SupplementLog[];
  } | null>(null);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      fetchSupplements();
      fetchTodayLogs(today);
      fetchNutrientTargets();
      fetchCustomNutrients();
    };

    fetchData();
  }, [fetchSupplements, fetchTodayLogs, fetchNutrientTargets, fetchCustomNutrients, today]);

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

  // Calculate custom nutrient progress
  const customNutrientProgress = useMemo(
    () => calculateCustomNutrientProgress(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayLogs, supplements, customNutrientMetadata]
  );

  // Handlers
  const handleSelectSupplementType = (type: SupplementType) => {
    setSelectedSupplementType(type);
    setIsTypeDialogOpen(false);
    setIsFormOpen(true);
  };

  const handleCreateSupplement = async (data: SupplementFormData) => {
    await createSupplement(data);
    setIsFormOpen(false);
    setEditingSupplement(undefined);
    setSelectedSupplementType(null);
  };

  const handleUpdateSupplement = async (data: SupplementFormData) => {
    if (editingSupplement) {
      await updateSupplement(editingSupplement.id, data);
      setIsFormOpen(false);
      setEditingSupplement(undefined);
      setSelectedSupplementType(null);
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
        <Button onClick={() => setIsTypeDialogOpen(true)}>
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
          <TabsTrigger value="custom-nutrients" className="gap-2">
            <Layers className="h-4 w-4" />
            Custom Nutrients
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

              {/* Today's Logs Section - Integrates into Daily Stack Card */}
              {todayLogs.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Today&apos;s Logs</h3>
                  </div>
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Supplements Card */}
          <CustomSupplementsCard
            customSupplements={getCustomSupplements()}
            todayLogs={todayLogs}
            customNutrientProgress={customNutrientProgress}
            onTake={handleTake}
          />

          {/* Vitamin and Mineral Progress Cards - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VitaminProgressCard progressData={nutrientProgress} />
            <MineralProgressCard progressData={nutrientProgress} />
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

        {/* Custom Nutrients Tab */}
        <TabsContent value="custom-nutrients">
          <Card>
            <CardHeader>
              <CardTitle>Manage Custom Nutrients</CardTitle>
              <CardDescription>
                Define custom nutrients like omega-3s or probiotics and set daily targets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomNutrientManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddSupplementTypeDialog
        open={isTypeDialogOpen}
        onOpenChange={setIsTypeDialogOpen}
        onSelectType={handleSelectSupplementType}
      />

      <SupplementDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingSupplement(undefined);
            setSelectedSupplementType(null);
          }
        }}
        supplement={editingSupplement}
        supplementType={selectedSupplementType || undefined}
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
