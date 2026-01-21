# Export/Import Feature Enhancement Plan

## Problem Statement

The current export functionality in `src/app/admin/page.tsx` is missing critical data:

- Meal logs (API endpoint doesn't exist)
- Meal favorites
- Daily summaries with health scores
- Calorie tracking history, streaks, and goal history
- Custom nutrient metadata
- Supplement logs history

Additionally, the import feature is only a placeholder with no actual implementation.

## Solution Overview

Create a comprehensive server-side export/import system that:

1. Exports ALL user data in a hierarchical JSON structure
2. Provides a robust import feature with validation and transaction safety
3. Supports both "Replace" and "Merge" import modes
4. Follows the user's requested hierarchy: timestamp → profile → allergies → meals → calories → supplements → health data

## JSON Export Structure

```json
{
  "export_metadata": {
    "timestamp": "2026-01-20T10:30:00.000Z",
    "version": "3.0",
    "export_type": "full_profile"
  },
  "profile_data": {
    "profile": {
      /* user profile */
    },
    "health_conditions": [],
    "allergies": [],
    "nutritional_targets": {}
  },
  "nutrition_data": {
    "meals": {
      "meal_logs": [],
      "meal_favorites": [],
      "recent_foods": []
    },
    "calories": {
      "current_goal": {},
      "goal_history": [],
      "daily_tracking": [],
      "streak_data": {
        "current_streak": {},
        "all_streaks": [],
        "streak_info": {}
      }
    }
  },
  "supplement_data": {
    "supplements": [],
    "supplement_logs": [],
    "nutrient_targets": [],
    "custom_nutrients_metadata": []
  },
  "health_data": {
    "daily_summaries": []
  }
}
```

## Implementation Plan

### Phase 1: Repository Extensions

Add "getAll" methods to repositories for comprehensive data retrieval:

**MealLogRepository** (`src/lib/database/repositories/mealLogRepository.ts`)

- Add `getAllMealLogs(startDate?, endDate?): MealLog[]`

**SupplementRepository** (`src/lib/database/repositories/supplementRepository.ts`)

- Add `getAllSupplementLogs(startDate?, endDate?): SupplementLog[]`

**CalorieTrackerRepository** (`src/lib/database/repositories/calorieTrackerRepository.ts`)

- Add `getAllDailyTracking(profileId, startDate?, endDate?): DailyCalorieTracking[]`
- Add `getAllStreaks(profileId): CalorieStreak[]`

**CalorieGoalRepository** (`src/lib/database/repositories/calorieGoalRepository.ts`)

- Add `getAllGoals(profileId): CalorieGoal[]`
- Add `getAllGoalHistory(profileId): CalorieGoalHistory[]`

**DailySummaryRepository** (`src/lib/database/repositories/dailySummaryRepository.ts`)

- Add `getAllDailySummaries(startDate?, endDate?): DailyLog[]`

### Phase 2: Export API Endpoint

Create **`src/app/api/export/route.ts`** (NEW)

- Server-side export orchestration
- Fetches data from all repositories
- Assembles complete JSON structure
- Handles errors gracefully (missing data = empty arrays)
- Returns JSON with proper headers

### Phase 3: Import Validation & Types

Create **`src/lib/types/export.ts`** (NEW)

- TypeScript interfaces for export structure
- Zod schemas for validation
- Version compatibility checking
- Data integrity validation helpers

Create **`src/lib/utils/importValidation.ts`** (NEW)

- Validation functions using Zod schemas
- Foreign key integrity checks
- Duplicate detection logic
- Version migration helpers

### Phase 4: Import API Endpoint

Create **`src/app/api/import/route.ts`** (NEW)

- Server-side import with transaction handling
- Two modes: "replace" (clear all data) and "merge" (keep existing)
- Ordered import respecting foreign key dependencies:
  1. Profile data (must come first)
  2. Supplements (before logs)
  3. Supplement logs and targets
  4. Meal logs and favorites
  5. Calorie goals and tracking
  6. Daily summaries (last, depends on everything)
- Rollback on critical errors
- Returns detailed import result with counts and warnings

**Data Clearing Order** (for Replace mode):

```typescript
// Children before parents to respect foreign keys
DELETE FROM daily_summary
DELETE FROM calorie_streaks
DELETE FROM daily_calorie_tracking
DELETE FROM calorie_goal_history
DELETE FROM calorie_goals
DELETE FROM meal_favorites
DELETE FROM meal_logs
DELETE FROM supplement_logs
DELETE FROM custom_nutrient_metadata
DELETE FROM supplement_nutrient_targets
DELETE FROM supplements
DELETE FROM user_allergies
DELETE FROM user_conditions
DELETE FROM nutritional_targets
DELETE FROM profile
```

### Phase 5: UI Enhancement

Update **`src/app/admin/page.tsx`**:

- Replace client-side export with API call to `/api/export`
- Add import mode selection (Replace vs Merge)
- Add progress indicators for both export and import
- Show detailed results after import (success counts, warnings, errors)
- Add confirmation dialog for Replace mode
- Improve file upload UI with drag-and-drop
- Display import preview before confirmation
- Update filename pattern: `health-tracker-export-YYYY-MM-DD-HHMMSS.json`

## Critical Files to Modify/Create

1. **src/app/api/export/route.ts** (NEW) - Server-side export endpoint
2. **src/app/api/import/route.ts** (NEW) - Server-side import with transactions
3. **src/lib/types/export.ts** (NEW) - Type definitions and Zod schemas
4. **src/lib/utils/importValidation.ts** (NEW) - Validation helpers
5. **src/app/admin/page.tsx** (MODIFY) - UI for export/import
6. **src/lib/database/repositories/mealLogRepository.ts** (MODIFY) - Add getAllMealLogs
7. **src/lib/database/repositories/supplementRepository.ts** (MODIFY) - Add getAllSupplementLogs
8. **src/lib/database/repositories/calorieTrackerRepository.ts** (MODIFY) - Add getAll methods
9. **src/lib/database/repositories/calorieGoalRepository.ts** (MODIFY) - Add getAll methods
10. **src/lib/database/repositories/dailySummaryRepository.ts** (MODIFY) - Add getAllDailySummaries

## Import Safety Features

### Transaction Handling

- Use SQLite transactions for atomic imports
- Rollback on critical errors (invalid profile, foreign key violations)
- Continue with warnings on non-critical errors (skip invalid records)

### Validation Layers

1. **Schema validation** - Zod schemas ensure correct structure
2. **Version compatibility** - Check export version, warn if mismatch
3. **Data integrity** - Validate foreign keys, required fields
4. **Duplicate detection** - Handle duplicates based on mode (skip or update)

### Error Handling

**Critical Errors** (abort import):

- Invalid JSON structure
- Missing profile data
- Database transaction failure

**Non-Critical Warnings** (continue with partial import):

- Invalid meal log (skip that record)
- Duplicate IDs in merge mode (skip or update)
- Missing foreign key references (skip that record)

### Import Result Format

```typescript
{
  success: true,
  imported: {
    profile: true,
    meals: 150,
    favorites: 3,
    supplements: 5,
    supplement_logs: 200,
    calorie_goals: 2,
    calorie_tracking: 30,
    daily_summaries: 30
  },
  warnings: [
    "2 meal logs had invalid food references - skipped"
  ],
  errors: []
}
```

## Verification Steps

After implementation, verify:

1. **Export completeness** - Check all data types are included in JSON
2. **Import in Replace mode** - Clear database, import, verify all data restored
3. **Import in Merge mode** - Import duplicate data, verify no conflicts
4. **Error handling** - Test with invalid JSON, missing fields, corrupt data
5. **Transaction rollback** - Simulate database error mid-import, verify rollback
6. **UI feedback** - Verify progress indicators, success/error messages
7. **File naming** - Check exported filename follows convention

## Testing Checklist

- [ ] Export creates valid JSON with all data
- [ ] Export handles missing optional data (empty arrays)
- [ ] Import validates JSON structure
- [ ] Import Replace mode clears all data first
- [ ] Import Merge mode preserves existing data
- [ ] Import handles invalid records gracefully
- [ ] Import rollback works on critical errors
- [ ] UI shows progress during operations
- [ ] UI displays detailed results after import
- [ ] Confirmation dialog appears for Replace mode
- [ ] Large exports (1000+ records) perform acceptably

## Notes

- **Privacy-first**: All data stays local (SQLite), no cloud storage
- **Single-user**: No authentication needed, exports full profile
- **Backward compatibility**: Consider versioning for future schema changes
- **Performance**: Large exports may take time, show progress to user
- **File size**: Years of data could be 1-10MB, warn if very large
