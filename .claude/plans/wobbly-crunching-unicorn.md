# Supplements Page Implementation Plan

## Summary

Transform the placeholder supplements page into a full-featured supplement management system with:

- Full CRUD for supplements (name, brand, color, dosage schedule, nutrients)
- 25 trackable nutrients (13 vitamins + 12 minerals)
- Timestamped logging when supplements are taken
- Layered progress bars showing colored contributions from each supplement
- RDA-based targets with custom override support
- Import via JSON file upload, paste, or pre-built templates

---

## User Requirements Confirmed

| Feature            | Decision                                      |
| ------------------ | --------------------------------------------- |
| Color assignment   | User picks color when creating supplement     |
| Progress bar style | Layered/transparent colored segments          |
| JSON import        | Both file upload AND paste options            |
| Log timing         | Exact timestamp when taken                    |
| Nutrients          | 13 vitamins + 12 minerals (extended set)      |
| Dosage info        | Full schedule (frequency, quantity, notes)    |
| DB import          | Search foods + pre-built supplement templates |
| Progress targets   | Default to RDA, allow custom overrides        |

---

## Implementation Phases

### Phase 1: Database Schema Updates

**File: `src/lib/database/schema.sql`**

Add new columns to `supplements` table:

```sql
ALTER TABLE supplements ADD COLUMN color TEXT DEFAULT '#6366f1';
ALTER TABLE supplements ADD COLUMN dosage_frequency TEXT DEFAULT 'daily';
ALTER TABLE supplements ADD COLUMN dosage_quantity INTEGER DEFAULT 1;
ALTER TABLE supplements ADD COLUMN dosage_notes TEXT;
```

Add `taken_at` to `supplement_logs`:

```sql
ALTER TABLE supplement_logs ADD COLUMN taken_at TEXT;
```

Create new `supplement_nutrient_targets` table:

```sql
CREATE TABLE IF NOT EXISTS supplement_nutrient_targets (
  id TEXT PRIMARY KEY,
  nutrient_key TEXT NOT NULL UNIQUE,
  target_value REAL NOT NULL,
  use_rda INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**File: `src/lib/database/connection.ts`** - Add migration logic for existing DBs

---

### Phase 2: Type Definitions

**New file: `src/lib/types/supplements.ts`**

```typescript
// Nutrient keys for 13 vitamins + 12 minerals
export type VitaminKey =
  | 'vitaminA'
  | 'vitaminD'
  | 'vitaminE'
  | 'vitaminK'
  | 'vitaminC'
  | 'thiamin'
  | 'riboflavin'
  | 'niacin'
  | 'pantothenicAcid'
  | 'vitaminB6'
  | 'biotin'
  | 'folate'
  | 'vitaminB12';

export type MineralKey =
  | 'calcium'
  | 'iron'
  | 'magnesium'
  | 'zinc'
  | 'potassium'
  | 'selenium'
  | 'copper'
  | 'manganese'
  | 'chromium'
  | 'iodine'
  | 'phosphorus'
  | 'sodium';

export interface Supplement {
  id: string;
  name: string;
  brand: string;
  servingSize: string;
  nutrients: Partial<Record<NutrientKey, number>>;
  notes?: string;
  color: string;
  dosageFrequency: 'daily' | 'weekly';
  dosageQuantity: number;
  dosageNotes?: string;
  createdAt: string;
}

export interface SupplementLog {
  id: string;
  date: string;
  supplementId: string;
  supplementName: string;
  taken: boolean;
  takenAt?: string; // ISO timestamp
  createdAt: string;
}

export interface NutrientProgress {
  nutrientKey: NutrientKey;
  name: string;
  unit: string;
  target: number;
  total: number;
  percentage: number;
  contributions: {
    supplementId: string;
    supplementName: string;
    color: string;
    amount: number;
    percentage: number;
  }[];
}
```

**New file: `src/constants/nutrients.ts`**

- Define all 25 nutrients with RDA defaults, units, categories
- Pre-built supplement templates (Multivitamin, Vitamin D, B-Complex, etc.)
- Preset color palette (16 colors)

---

### Phase 3: Repository Layer

**File: `src/lib/database/repositories/supplementRepository.ts`**

Add methods:

- `createSupplement(data)` - Create new supplement
- `updateSupplement(id, data)` - Update existing
- `deleteSupplement(id)` - Delete supplement + associated logs
- `getSupplementById(id)` - Fetch single supplement
- `getSupplementLogsByDateAndId(date, supplementId)` - Multiple logs per supplement
- `deleteSupplementLog(id)` - Remove specific log entry
- `getAllNutrientTargets()` - Get custom targets
- `upsertNutrientTarget(key, value, useRda)` - Set custom target

Update existing methods:

- `logSupplementTaken()` - Add `takenAt` parameter
- `getAllSupplements()` - Map new columns
- `getSupplementLogsByDate()` - Include `takenAt` field

---

### Phase 4: API Routes

**Update: `src/app/api/supplements/route.ts`**

- GET: List supplements OR logs by date (existing)
- POST: Create supplement OR log taken (distinguish by body shape)
- PUT: Update supplement
- DELETE: Delete supplement by ID

**New: `src/app/api/supplements/logs/route.ts`**

- DELETE: Remove specific log entry

**New: `src/app/api/supplements/targets/route.ts`**

- GET: List all custom nutrient targets
- POST: Upsert a nutrient target

---

### Phase 5: Zustand Store

**New file: `src/lib/store/supplementStore.ts`**

State:

- `supplements: Supplement[]`
- `todayLogs: SupplementLog[]`
- `nutrientTargets: SupplementNutrientTarget[]`
- `isLoading`, `error`

Actions:

- `fetchSupplements()`, `createSupplement()`, `updateSupplement()`, `deleteSupplement()`
- `fetchTodayLogs(date)`, `logSupplementTaken()`, `deleteLog()`
- `fetchNutrientTargets()`, `updateNutrientTarget()`
- `calculateNutrientProgress(date)` - Compute layered progress data

---

### Phase 6: UI Components

**New components in `src/components/supplements/`:**

| Component                   | Purpose                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `ColorPicker.tsx`           | Preset color grid + custom hex input                        |
| `NutrientInput.tsx`         | Dropdown (vitamin/mineral) + amount field with unit         |
| `SupplementCard.tsx`        | Display supplement with color dot, dosage info, edit/delete |
| `SupplementForm.tsx`        | Full create/edit form (inside dialog)                       |
| `SupplementDialog.tsx`      | Dialog wrapper for create/edit                              |
| `LayeredProgressBar.tsx`    | Stacked transparent colored segments                        |
| `NutrientProgressCard.tsx`  | Single nutrient row with layered bar + tooltip              |
| `NutrientProgressGrid.tsx`  | Grid of all 25 nutrients grouped by category                |
| `SupplementLogItem.tsx`     | Single log entry with timestamp + delete                    |
| `TakeSupplementButton.tsx`  | Button to log supplement with current time                  |
| `JSONImportDialog.tsx`      | Tabs for file upload + paste textarea                       |
| `TemplateSelector.tsx`      | Grid of pre-built supplement cards                          |
| `NutrientTargetsEditor.tsx` | Table to view/edit custom targets                           |

**Update: `src/components/supplements/SupplementsSkeleton.tsx`** - Match new layout

---

### Phase 7: Page Layout

**File: `src/app/supplements/page.tsx`** (complete rewrite)

```
+--------------------------------------------------+
| Supplements                    [+ Add Supplement] |
| Manage your daily supplement routine...           |
+--------------------------------------------------+
| [My Stack] [Templates] [Import] [Targets]         |  <- Tabs
+--------------------------------------------------+
|                                                   |
| LEFT COLUMN (lg:col-span-2)                       |
| +---------------------------------------------+   |
| | Daily Stack                                 |   |
| | [SupplementCard] [SupplementCard]           |   |
| | [SupplementCard] [SupplementCard]           |   |
| +---------------------------------------------+   |
| +---------------------------------------------+   |
| | Today's Logs                                |   |
| | [SupplementLogItem with timestamp + delete] |   |
| | [SupplementLogItem]                         |   |
| +---------------------------------------------+   |
|                                                   |
| RIGHT COLUMN (lg:col-span-1)                      |
| +---------------------------------------------+   |
| | Nutrient Progress                           |   |
| | Vitamins:                                   |   |
| |   Vitamin A [====|===|=] 120% (tooltip)     |   |
| |   Vitamin C [=======   ] 80%                |   |
| | Minerals:                                   |   |
| |   Calcium   [===|==    ] 60%                |   |
| +---------------------------------------------+   |
+--------------------------------------------------+
```

**Responsive:**

- Desktop: 3-column grid (2 left, 1 right)
- Mobile: Stacked with collapsible sections

---

### Phase 8: Validation

**New file: `src/lib/validations/supplements.ts`**

Zod schemas:

- `supplementFormSchema` - Validate create/edit form
- `supplementImportSchema` - Validate JSON import array
- `nutrientTargetSchema` - Validate target update

---

## Files to Create

| Path                                                   | Description                        |
| ------------------------------------------------------ | ---------------------------------- |
| `src/lib/types/supplements.ts`                         | Type definitions                   |
| `src/constants/nutrients.ts`                           | Nutrient data + templates + colors |
| `src/lib/store/supplementStore.ts`                     | Zustand store                      |
| `src/lib/validations/supplements.ts`                   | Zod schemas                        |
| `src/app/api/supplements/logs/route.ts`                | Log deletion API                   |
| `src/app/api/supplements/targets/route.ts`             | Targets API                        |
| `src/components/supplements/ColorPicker.tsx`           | Color picker                       |
| `src/components/supplements/NutrientInput.tsx`         | Nutrient selector                  |
| `src/components/supplements/SupplementCard.tsx`        | Supplement display                 |
| `src/components/supplements/SupplementForm.tsx`        | Create/edit form                   |
| `src/components/supplements/SupplementDialog.tsx`      | Dialog wrapper                     |
| `src/components/supplements/LayeredProgressBar.tsx`    | Stacked bar                        |
| `src/components/supplements/NutrientProgressCard.tsx`  | Progress row                       |
| `src/components/supplements/NutrientProgressGrid.tsx`  | Progress grid                      |
| `src/components/supplements/SupplementLogItem.tsx`     | Log entry                          |
| `src/components/supplements/TakeSupplementButton.tsx`  | Take button                        |
| `src/components/supplements/JSONImportDialog.tsx`      | Import dialog                      |
| `src/components/supplements/TemplateSelector.tsx`      | Template grid                      |
| `src/components/supplements/NutrientTargetsEditor.tsx` | Targets table                      |

## Files to Modify

| Path                                                    | Changes                                    |
| ------------------------------------------------------- | ------------------------------------------ |
| `src/lib/database/schema.sql`                           | Add columns + new table                    |
| `src/lib/database/connection.ts`                        | Add migration for existing DBs             |
| `src/lib/database/repositories/supplementRepository.ts` | Add CRUD + targets                         |
| `src/lib/types/health.ts`                               | Update Supplement/SupplementLog interfaces |
| `src/app/api/supplements/route.ts`                      | Add PUT/DELETE, update POST                |
| `src/app/supplements/page.tsx`                          | Complete rewrite                           |
| `src/components/supplements/SupplementsSkeleton.tsx`    | Update for new layout                      |

---

## Verification Plan

1. **Database Migration**
   - Run app, verify new columns exist in `supplements` table
   - Verify `supplement_nutrient_targets` table created
   - Existing supplements still load correctly

2. **Supplement CRUD**
   - Create new supplement with all fields (name, brand, color, dosage, nutrients)
   - Edit existing supplement, verify changes persist
   - Delete supplement, verify logs also deleted

3. **Logging**
   - Click "Take Now" on supplement, verify log created with timestamp
   - Take same supplement again, verify second log appears
   - Delete a log entry, verify it's removed

4. **Progress Visualization**
   - Add supplement with Vitamin C, take it
   - Verify Vitamin C progress bar shows contribution with supplement's color
   - Add second supplement with Vitamin C, take it
   - Verify bar shows two layered colors
   - Hover on bar, verify tooltip shows breakdown

5. **Import**
   - Test JSON file upload with valid data
   - Test JSON paste with valid data
   - Test invalid JSON shows error

6. **Templates**
   - Click a pre-built template
   - Verify form auto-fills with template data
   - Save and verify supplement created correctly

7. **Custom Targets**
   - Open targets editor
   - Change Vitamin C target from RDA to custom value
   - Verify progress bar updates to reflect new target

8. **Run Tests**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

---

## Notes

- Extends existing `healthStore.ts` pattern - creates separate `supplementStore.ts` for cleaner separation
- Uses existing shadcn/ui components (Card, Dialog, Table, Progress, Button, Input, Select, Tabs)
- Follows established patterns from MealLogForm for form validation and toast notifications
- All data persists to local SQLite - no cloud sync
