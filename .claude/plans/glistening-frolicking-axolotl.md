# Fix Load Profile Database Schema Mismatch

## Problem

When clicking "Load Profile" on the Admin page, the operation fails with a 500 Internal Server Error:

```
table daily_calorie_tracking has no column named calorie_deficit_surplus
```

The user is trying to hydrate mock data into the Calories page using the 3 profiles (weight_loss, maintenance, weight_gain) but cannot load them due to this error.

## Root Cause

The `/api/debug/reset-profile` endpoint has a typo in the SQL INSERT statement for the `daily_calorie_tracking` table.

**Incorrect column name** (line 127 in `src/app/api/debug/reset-profile/route.ts`):

```typescript
calorie_deficit_surplus; // ❌ Singular "calorie"
```

**Actual column name** (from migration `008_calorie_tracking.sql`):

```sql
calories_deficit_surplus  // ✅ Plural "calories"
```

The database schema uses the **plural** form `calories_deficit_surplus`, but the debug API route uses the **singular** form `calorie_deficit_surplus`.

## Files Affected

### File with Error

- `src/app/api/debug/reset-profile/route.ts` (line 127)

### Files Using Correct Column Name

- `src/lib/database/migrations/008_calorie_tracking.sql` (schema definition)
- `src/lib/database/repositories/calorieTrackerRepository.ts` (all INSERT/UPDATE statements)
- `src/app/api/import/route.ts` (line 400)
- `src/lib/types/calorieTracking.ts` (TypeScript interface uses `calorieDeficitSurplus` in camelCase)

## Solution

### Change Required

**File**: `src/app/api/debug/reset-profile/route.ts`

**Line 127** - Change from:

```typescript
const insertDailyTrackingStmt = db.prepare(`
  INSERT INTO daily_calorie_tracking (
    id, date, profile_id, calories_consumed, calories_target,
    calorie_deficit_surplus, goal_met, trend, created_at, updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
```

**To**:

```typescript
const insertDailyTrackingStmt = db.prepare(`
  INSERT INTO daily_calorie_tracking (
    id, date, profile_id, calories_consumed, calories_target,
    calories_deficit_surplus, goal_met, trend, created_at, updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
```

**Summary**: Change `calorie_deficit_surplus` to `calories_deficit_surplus` (add 's' to make "calorie" plural).

## Implementation Steps

1. Edit `src/app/api/debug/reset-profile/route.ts`:
   - Line 127: Change `calorie_deficit_surplus` to `calories_deficit_surplus`
   - This is a simple typo fix - one word change

## Verification

### Manual Testing

1. Start dev server: `npm run dev`
2. Navigate to `/admin`
3. Test each profile load:
   - Select "Weight Loss Profile"
   - Click "Load Profile"
   - Confirm the warning dialog
   - Verify profile loads successfully without error
   - Check that meal data is populated (30 days of mock data)
4. Repeat for "Maintenance Profile" and "Weight Gain Profile"
5. Navigate to the Calories page to verify the mock data is visible

### Expected Behavior

- No 500 Internal Server Error
- Success toast: "Profile loaded successfully: Profile reset to weight loss with 30 days of meal data (X meals)"
- The `/admin` page should not show any console errors
- Meal logs should be visible on the Calories page

### Database State After Load

Each profile load should:

- Update the profile table with mock profile data (age, gender, weight, height, activity level)
- Archive existing calorie goal and create a new one
- Clear existing meal logs and tracking data for the past 30 days
- Insert 30 days of mock meal data
- Create daily_calorie_tracking entries for each day with meals

## Notes

- This is a simple typo fix - the column name in the schema has always been `calories_deficit_surplus` (plural)
- The CalorieTrackerRepository already uses the correct column name
- The TypeScript types use camelCase `calorieDeficitSurplus` which is correctly mapped
- Only the debug API route had this typo
