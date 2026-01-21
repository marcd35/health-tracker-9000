# Supplements Page UI/UX Redesign Plan

## Overview

Redesign the Nutrient Progress section to add visual hierarchy and support custom supplements (fish oil, CoQ10, etc.) that don't have FDA RDAs. Also introduce a proper migrations system.

## Changes

### 1. Database Migrations System (New)

**New folder:** `src/lib/database/migrations/`

Create a versioned migrations system:

- `src/lib/database/migrations/001_initial_schema.sql` - Base schema (CREATE TABLE IF NOT EXISTS)
- `src/lib/database/migrations/002_supplements_dosage.sql` - color, dosage_frequency, dosage_quantity, dosage_notes
- `src/lib/database/migrations/003_supplement_logs_timestamp.sql` - taken_at, is_duplicate_warning
- `src/lib/database/migrations/004_foods_usda.sql` - source, usda_fdc_id, brand_name, ingredients, nutrients
- `src/lib/database/migrations/005_supplement_type.sql` - supplement_type column + data migration

**New file:** `src/lib/database/migrationRunner.ts`

- Create `_migrations` table to track applied migrations
- Scan migrations folder, run unexecuted ones in order
- Wrap each migration in a transaction

**Update:** `src/lib/database/connection.ts`

- Replace inline `runMigrations()` with call to new migration runner
- Keep schema.sql as documentation only (or remove)

### 2. Type Changes

**File:** `src/lib/types/supplements.ts`

Add `supplementType` discriminator:

```typescript
export type SupplementType = 'nutrient' | 'custom';

// Add to Supplement interface:
supplementType: SupplementType;

// Add to SupplementFormData and SupplementTemplate
```

### 3. Repository Updates

**File:** `src/lib/database/repositories/supplementRepository.ts`

- Update mapper to handle `supplement_type` column with fallback inference
- Update create/update methods to persist the new field

### 4. Constants Updates

**File:** `src/constants/nutrients.ts`

- Add `supplementType: 'nutrient'` to existing templates
- Add new `CUSTOM_SUPPLEMENT_TEMPLATES` array with: Fish Oil, CoQ10, Probiotics, Ashwagandha, Creatine, Collagen

### 5. New Components

**`src/components/supplements/VitaminProgressCard.tsx`**

- Card with vitamin-themed header (amber icon)
- Table showing only vitamins (13 nutrients)
- Reuses the existing `NutrientRow` logic

**`src/components/supplements/MineralProgressCard.tsx`**

- Card with mineral-themed header (emerald icon)
- Table showing only minerals (14 nutrients)

**`src/components/supplements/CustomSupplementsCard.tsx`**

- Card for non-FDA-tracked supplements
- Simple list: supplement name, taken status, take button
- No progress bars (no RDA targets)

**`src/components/supplements/AddSupplementTypeDialog.tsx`**

- Initial dialog when clicking "Add Supplement"
- Two clickable cards: "Vitamin/Mineral Supplement" vs "Custom Supplement"
- Avoids long dropdown by categorizing upfront

### 6. Updated Components

**`src/components/supplements/SupplementForm.tsx`**

- Accept `supplementType` prop
- If `'custom'`: hide Nutrients section, show info message
- If `'nutrient'`: show existing nutrients input

**`src/components/supplements/TemplateSelector.tsx`**

- Split into two tabs: "Vitamin/Mineral" and "Custom"
- Filter templates by `supplementType`

### 7. Store Updates

**File:** `src/lib/store/supplementStore.ts`

Add computed getters:

- `getNutrientSupplements()` - filter by type or infer from nutrients
- `getCustomSupplements()` - filter by type or empty nutrients

Update `calculateNutrientProgress()` return type to:

```typescript
{ vitamins: NutrientProgress[], minerals: NutrientProgress[] }
```

### 8. Page Layout Updates

**File:** `src/app/supplements/page.tsx`

New layout for "My Stack" tab:

```
┌─────────────────────────────────────────────┐
│ Daily Stack (existing supplement cards)     │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Custom Supplements                          │
│ (fish oil, CoQ10, etc. - taken/not taken)  │
└─────────────────────────────────────────────┘
┌──────────────────────┐ ┌──────────────────────┐
│ Vitamin Progress     │ │ Mineral Progress     │
│ (13 vitamins table)  │ │ (14 minerals table)  │
└──────────────────────┘ └──────────────────────┘
```

Add type selection flow:

- "Add Supplement" button opens `AddSupplementTypeDialog`
- User picks type → opens `SupplementForm` with that type

### 9. Delete/Deprecate

- `src/components/supplements/NutrientTrackingTable.tsx` - replaced by split cards

## Implementation Order

1. **Migrations System** - Create migrationRunner.ts, extract existing migrations to SQL files
2. **Types & DB** - Add `SupplementType`, create migration 005, repository updates
3. **Constants** - Add custom templates, update existing templates
4. **Store** - Add filtered getters, update progress calculation
5. **New Components** - VitaminProgressCard, MineralProgressCard, CustomSupplementsCard, AddSupplementTypeDialog
6. **Update Components** - SupplementForm, TemplateSelector
7. **Page Integration** - Wire up new layout and add flow
8. **Cleanup** - Remove old NutrientTrackingTable, clean up connection.ts

## Files to Modify

- `src/lib/database/connection.ts` - Replace inline migrations with runner call
- `src/lib/database/repositories/supplementRepository.ts`
- `src/lib/types/supplements.ts`
- `src/constants/nutrients.ts`
- `src/lib/store/supplementStore.ts`
- `src/components/supplements/SupplementForm.tsx`
- `src/components/supplements/TemplateSelector.tsx`
- `src/app/supplements/page.tsx`

## New Files

- `src/lib/database/migrationRunner.ts` - Migration runner with tracking table
- `src/lib/database/migrations/001_initial_schema.sql`
- `src/lib/database/migrations/002_supplements_dosage.sql`
- `src/lib/database/migrations/003_supplement_logs_timestamp.sql`
- `src/lib/database/migrations/004_foods_usda.sql`
- `src/lib/database/migrations/005_supplement_type.sql`
- `src/components/supplements/VitaminProgressCard.tsx`
- `src/components/supplements/MineralProgressCard.tsx`
- `src/components/supplements/CustomSupplementsCard.tsx`
- `src/components/supplements/AddSupplementTypeDialog.tsx`

## Verification

1. Run `npm run dev` and navigate to /supplements
2. Verify vitamins and minerals display in separate cards
3. Add a custom supplement (e.g., CoQ10) - should appear in Custom Supplements section
4. Add a nutrient supplement (e.g., Vitamin D) - should contribute to Vitamin Progress
5. Existing supplements should auto-categorize correctly
6. Run `npm test` to ensure no regressions
