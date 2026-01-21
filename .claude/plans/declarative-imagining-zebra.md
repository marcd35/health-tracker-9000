# Plan: Custom Nutrient Progress Tracking System

## Overview

Transform the Custom Supplements card from a simple checklist to a comprehensive progress tracking system similar to Vitamin/Mineral progress cards. Enable users to track custom nutrients (EPA, DHA, ALA, etc.) with user-defined goals and visualize daily progress.

## Context

**Current State:**

- `CustomSupplementsCard` only shows taken/not taken status (simple checklist)
- Custom supplements have empty `nutrients: {}` object
- No progress tracking for non-FDA nutrients like omega-3s
- No way to set or track goals for custom nutrients

**User Requirements:**

- Track custom nutrients (EPA, DHA, ALA) with numerical values
- Show progress bars like vitamin/mineral cards (red/yellow/green)
- Support both direct value input (300mg) and percentage input (45-67% of 600mg)
- Store values in supplement definition (all logs use same values)
- User sets their own daily targets (no default RDA)
- System should prepopulate common supplements (Nature's Truth Fish Oil, etc.)

**Key Design Decisions:**

- Custom nutrients stored separately from FDA nutrients (type safety)
- User-defined targets (no RDA defaults for custom nutrients)
- Percentage ranges use midpoint for calculation
- Backward compatible with existing custom supplements

## Architecture

### Data Model

**Dual-track approach:** Keep FDA nutrients and custom nutrients separate

**New Types** (`src/lib/types/supplements.ts`):

```typescript
// Metadata for custom nutrients (user creates these)
interface CustomNutrientMetadata {
  key: string; // e.g., "epa", "dha", "ala"
  name: string; // e.g., "EPA (Omega-3)"
  unit: string; // e.g., "mg"
  category: string; // e.g., "omega3", "probiotic"
  userDefinedTarget?: number; // Daily goal (optional)
}

// Progress data for custom nutrients
interface CustomNutrientProgress {
  nutrientKey: string;
  name: string;
  unit: string;
  target: number | null; // null = no target set
  total: number; // Today's intake
  percentage: number; // 0 if no target
  contributions: NutrientContribution[];
}

// Update Supplement interface
interface Supplement {
  // ... existing fields
  nutrients: Partial<Record<NutrientKey, number>>; // FDA nutrients (unchanged)
  customNutrients: Record<string, number>; // NEW: custom nutrients
}
```

**Database Schema Changes** (Migration 006):

```sql
-- Add custom nutrients column
ALTER TABLE supplements ADD COLUMN custom_nutrients TEXT DEFAULT '{}';

-- Custom nutrient definitions table
CREATE TABLE custom_nutrient_metadata (
  id TEXT PRIMARY KEY,
  nutrient_key TEXT UNIQUE,
  name TEXT,
  unit TEXT,
  category TEXT,
  user_defined_target REAL,
  created_at TEXT,
  updated_at TEXT
);

-- Supplement database for prepopulation
CREATE TABLE supplement_database (
  id TEXT PRIMARY KEY,
  name TEXT,
  brand TEXT,
  serving_size TEXT,
  serving_count INTEGER,
  nutrients TEXT DEFAULT '{}',
  custom_nutrients TEXT DEFAULT '{}',
  created_at TEXT,
  UNIQUE(name, brand, serving_size, serving_count)
);
```

### Data Flow

1. **Supplement Definition:**

   ```json
   {
     "id": "supp-002",
     "name": "Fish Oil",
     "brand": "Nature's Truth",
     "customNutrients": {
       "epa": 336, // 56% of 600mg (midpoint of 45-67%)
       "dha": 231 // 38.5% of 600mg (midpoint of 30-47%)
     }
   }
   ```

2. **User Takes Supplement:** Log created with `supplementId` and `taken: true`

3. **Progress Calculation:**
   - Find all supplements with `customNutrients.epa`
   - Count taken logs for each
   - Sum: EPA total = 336mg × 2 logs = 672mg
   - Compare to user target (e.g., 500mg)
   - Result: 134% (green progress bar)

## Implementation Phases

### Phase 1: Core Infrastructure (2-3 days)

**Goal:** Add custom nutrient support to types, database, and repository

**Tasks:**

1. **Type Definitions** (`src/lib/types/supplements.ts`):
   - Add `CustomNutrientMetadata` interface
   - Add `CustomNutrientProgress` interface
   - Update `Supplement` interface with `customNutrients` field

2. **Database Migration** (`src/lib/database/migrations/006_custom_nutrients.sql`):
   - Add `custom_nutrients` column to supplements table
   - Create `custom_nutrient_metadata` table
   - Create `supplement_database` table

3. **Repository Updates** (`src/lib/database/repositories/supplementRepository.ts`):
   - Update `mapRowToSupplement()` to parse `customNutrients`
   - Add CRUD methods for custom nutrient metadata
   - Add search method for supplement database

4. **API Routes:**
   - `GET /api/supplements/custom-nutrients` - List user's custom nutrients
   - `POST /api/supplements/custom-nutrients` - Create/update custom nutrient
   - `PUT /api/supplements/custom-nutrients/:key` - Update target
   - `DELETE /api/supplements/custom-nutrients/:key` - Delete custom nutrient
   - `GET /api/supplements/database/search` - Search supplement database

5. **Store Updates** (`src/lib/store/supplementStore.ts`):
   - Add `customNutrientMetadata: CustomNutrientMetadata[]` state
   - Add `fetchCustomNutrients()` method
   - Add `calculateCustomNutrientProgress()` method (similar to `calculateNutrientProgress`)
   - Add `updateCustomNutrientTarget()` method

**Verification:**

- Migration runs without errors on existing database
- Can create custom nutrient: EPA, 500mg target, omega3 category
- Can store supplement with `customNutrients: { epa: 336 }`
- Existing supplements load correctly with empty `customNutrients: {}`

### Phase 2: UI Components (3-4 days)

**Goal:** Build user interfaces for managing and inputting custom nutrients

**New Components:**

1. **`CustomNutrientInput.tsx`:**
   - Dropdown of available custom nutrients (from metadata)
   - Numeric input with dynamic unit display
   - Remove button
   - Similar to existing `NutrientInput.tsx` but for custom nutrients

2. **`PercentageCalculator.tsx`:**
   - Base amount input (e.g., 600mg omega-3s)
   - Percentage range inputs (min: 45%, max: 67%)
   - Calculate midpoint: (45 + 67) / 2 = 56%
   - Result: 56% × 600mg = 336mg
   - "Use This Value" button to populate form

3. **`CustomNutrientManager.tsx`:**
   - Table of user's custom nutrients
   - Columns: Name, Unit, Category, Daily Target, Actions
   - Add/Edit/Delete custom nutrients
   - Set targets inline (editable input)
   - Warning when deleting nutrient in use by supplements

**Component Updates:**

4. **Update `SupplementForm.tsx`:**
   - Add custom nutrient section when `supplementType === 'custom'`
   - Show `CustomNutrientInput` components
   - Add "Percentage Calculator" collapsible section
   - Handle `customNutrients` state array
   - Submit includes `customNutrients` object

5. **Add Supplements Page Tab:**
   - New "Custom Nutrients" tab alongside "Supplements" and "Templates"
   - Renders `CustomNutrientManager` component
   - Allows managing nutrient definitions and targets

**Verification:**

- Can add EPA/DHA to fish oil supplement
- Percentage calculator: 45-67% of 600mg = 336mg EPA
- Custom nutrient manager shows all user's nutrients
- Can set EPA target to 500mg/day

### Phase 3: Progress Tracking (2 days)

**Goal:** Calculate and visualize daily custom nutrient progress

**Tasks:**

1. **Implement Progress Calculation** (`supplementStore.ts`):

   ```typescript
   calculateCustomNutrientProgress(): CustomNutrientProgress[] {
     const { supplements, todayLogs, customNutrientMetadata } = get();

     // For each custom nutrient metadata entry
     return customNutrientMetadata.map((metadata) => {
       let total = 0;
       const contributions: NutrientContribution[] = [];

       // Find supplements with this custom nutrient
       supplements.forEach((supp) => {
         const amount = supp.customNutrients[metadata.key];
         if (!amount) return;

         // Count taken logs
         const takenCount = todayLogs.filter(
           (log) => log.supplementId === supp.id && log.taken
         ).length;

         const contribution = amount * takenCount;
         total += contribution;

         if (takenCount > 0) {
           contributions.push({
             supplementId: supp.id,
             supplementName: supp.name,
             color: supp.color,
             amount: contribution,
             percentage: metadata.userDefinedTarget
               ? (contribution / metadata.userDefinedTarget) * 100
               : 0,
           });
         }
       });

       return {
         nutrientKey: metadata.key,
         name: metadata.name,
         unit: metadata.unit,
         target: metadata.userDefinedTarget || null,
         total,
         percentage: metadata.userDefinedTarget
           ? (total / metadata.userDefinedTarget) * 100
           : 0,
         contributions,
       };
     });
   }
   ```

2. **Redesign `CustomSupplementsCard.tsx`:**
   - Keep supplement checklist section (top)
   - Add new progress tracking section (bottom)
   - Conditional render: only show progress if custom nutrients exist
   - Table layout matching `VitaminProgressCard`:
     - Columns: Nutrient Name, Progress Bar, Intake, Target
     - Progress bar with red/yellow/green color coding
     - "No target set" state for nutrients without targets

3. **Update Supplements Page** (`src/app/supplements/page.tsx`):
   - Call `calculateCustomNutrientProgress()` from store
   - Pass result to `CustomSupplementsCard` as prop

**Verification:**

- Taking fish oil 2x shows 672mg EPA (336mg × 2)
- Progress bar shows 134% if target is 500mg
- Green color when ≥100% of target
- Yellow when <100%, Red when 0%
- Shows "No target set" when target is null

### Phase 4: Supplement Database (2-3 days)

**Goal:** Prepopulate common supplements for auto-fill convenience

**Tasks:**

1. **Create Seed Data** (`src/lib/database/supplementDatabaseSeed.ts`):

   ```typescript
   export const SUPPLEMENT_DATABASE = [
     {
       name: 'Fish Oil',
       brand: "Nature's Truth",
       serving_size: '2 softgels',
       serving_count: 250,
       customNutrients: {
         epa: 336, // Midpoint of 45-67% × 600mg
         dha: 231, // Midpoint of 30-47% × 600mg
       },
       notes: '2000mg fish oil, 600mg omega-3s',
     },
     {
       name: 'Fish Oil',
       brand: 'Nordic Naturals',
       serving_size: '2 softgels',
       serving_count: 180,
       customNutrients: {
         epa: 325,
         dha: 225,
       },
     },
     // Add 50+ common supplements
   ];
   ```

2. **Database Search API** (`src/app/api/supplements/database/search/route.ts`):
   - Query supplement_database table
   - Match on name (fuzzy) + brand (exact)
   - Return best match with all fields

3. **Auto-fill in Form** (`SupplementForm.tsx`):
   - Debounced search on name + brand change
   - Show suggestion banner when match found
   - "Auto-fill values" button
   - Populates all fields including customNutrients

**Verification:**

- Typing "Nature's Truth Fish Oil" shows suggestion
- Auto-fill populates EPA: 336mg, DHA: 231mg
- Can reject and enter manually
- Database contains 50+ common supplements

## Critical Files

### Core Type System

- **`src/lib/types/supplements.ts`** - Add CustomNutrientMetadata, CustomNutrientProgress, update Supplement

### Database Layer

- **`src/lib/database/migrations/006_custom_nutrients.sql`** - New tables and columns
- **`src/lib/database/repositories/supplementRepository.ts`** - CRUD for custom nutrients and database

### State Management

- **`src/lib/store/supplementStore.ts`** - Add calculateCustomNutrientProgress(), custom nutrient state

### API Routes

- **`src/app/api/supplements/custom-nutrients/route.ts`** - Custom nutrient CRUD
- **`src/app/api/supplements/database/search/route.ts`** - Supplement database lookup
- **`src/app/api/supplements/route.ts`** - Update to handle customNutrients field

### UI Components

- **`src/components/supplements/SupplementForm.tsx`** - Add custom nutrient inputs
- **`src/components/supplements/CustomSupplementsCard.tsx`** - Redesign with progress tracking
- **`src/components/supplements/CustomNutrientInput.tsx`** - NEW: Input for custom nutrients
- **`src/components/supplements/PercentageCalculator.tsx`** - NEW: Percentage converter
- **`src/components/supplements/CustomNutrientManager.tsx`** - NEW: Manage nutrient definitions
- **`src/app/supplements/page.tsx`** - Add Custom Nutrients tab, calculate progress

## Edge Cases & Solutions

### No Target Set

- Display progress bar in gray
- Show "No target set" text
- Percentage = 0 (or N/A)
- Still show total intake

### Custom Supplement with No Custom Nutrients

- Valid state: `customNutrients: {}`
- Appears only in checklist section
- No contribution to progress

### Deleting Custom Nutrient In Use

- Show confirmation with affected supplements list
- On confirm: Remove from all supplements' `customNutrients` objects

### Backward Compatibility

- Migration adds `custom_nutrients = '{}'` to existing supplements
- Repository handles both null and empty object
- Existing custom supplements work unchanged

### Unit Consistency

- Standardize units per category (omega-3s = mg, probiotics = CFU)
- Show unit in metadata
- Validate on creation

## Verification Plan

### Phase 1 Testing

```bash
# Run migration
npm run db:migrate

# Test API endpoints
curl http://localhost:3000/api/supplements/custom-nutrients

# Verify database
sqlite3 data/health.db "SELECT * FROM custom_nutrient_metadata"
```

### Phase 2 Testing

1. Open supplements page
2. Click "Add Supplement" → "Custom"
3. Fill Name: "Fish Oil", Brand: "Nature's Truth"
4. Click "Add Custom Nutrient"
5. Use percentage calculator: 45-67% of 600mg
6. Verify result: 336mg EPA
7. Save supplement
8. Navigate to "Custom Nutrients" tab
9. Set EPA target: 500mg/day
10. Verify target saved

### Phase 3 Testing

1. Navigate to Dashboard
2. Locate Custom Supplements card
3. Click "Take" on Fish Oil (2x)
4. Verify progress table shows:
   - EPA: 672mg / 500mg (134%)
   - Green progress bar
   - 2 contributions from Fish Oil

### Phase 4 Testing

1. Create new supplement
2. Type "Nature's Truth" in brand
3. Type "Fish Oil" in name
4. Verify suggestion banner appears
5. Click "Auto-fill values"
6. Verify EPA and DHA populated
7. Save and test logging

## Success Criteria

- ✅ Custom nutrients (EPA, DHA, ALA) can be defined with targets
- ✅ Supplements can store custom nutrient values
- ✅ Custom Supplements card shows progress bars (like Vitamin card)
- ✅ Progress calculated correctly from logs
- ✅ Percentage calculator works (45-67% → 336mg)
- ✅ Supplement database prepopulates common products
- ✅ Backward compatible with existing data
- ✅ No FDA nutrient functionality broken

## Estimated Timeline

- **Phase 1:** 2-3 days (Foundation)
- **Phase 2:** 3-4 days (UI Components)
- **Phase 3:** 2 days (Progress Tracking)
- **Phase 4:** 2-3 days (Database Prepopulation)

**Total:** ~10-12 days for complete implementation
