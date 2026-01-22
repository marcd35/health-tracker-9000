# Implementation Plan: Dashboard UX & State Improvements

Updated: 1/21/26

## Overview

Implement UX improvements, fix critical date consistency bug, add hydration tracking toggle, enhance USDA search, and add profile name field.

## Priority Order

1. **CRITICAL**: Global date consistency bug fix (observed bug)
2. Date navigation & temporal clarity UI
3. Hydration weighting logic
4. USDA search UX improvement
5. Profile name field
6. Health Trends & Settings (already implemented - verify only)

---

## 1. Global Date Consistency Bug Fix (CRITICAL)

### Problem Analysis

**Root Cause**: Zustand store persists dailyLog state across page navigation. When switching tabs, pages render with stale dailyLog data from a previous date before new data finishes loading.

**Observed Behavior**:

- User views yesterday's data on one page
- Navigates to another page
- Page briefly (or permanently) shows yesterday's data instead of today's data

### Solution: Single Source of Truth - Global ActiveDate State

#### 1.1 Add activeDate State to healthStore

**File**: `src/lib/store/healthStore.ts`

Add to interface (after line 15):

```typescript
activeDate: string; // ISO date string (YYYY-MM-DD)
```

Add to state initialization (after line 58):

```typescript
activeDate: new Date().toISOString().split('T')[0], // Initialize to today
```

Add actions (after line 61):

```typescript
setActiveDate: (date: string) => {
  set({ activeDate: date });
  // Auto-fetch daily log when activeDate changes
  get().fetchDailyLog(date);
  get().fetchWeeklySummary(date);
},

navigateToYesterday: () => {
  const current = new Date(get().activeDate);
  current.setDate(current.setDate() - 1);
  const yesterday = current.toISOString().split('T')[0];
  get().setActiveDate(yesterday);
},

navigateToTomorrow: () => {
  const current = new Date(get().activeDate);
  current.setDate(current.getDate() + 1);
  const tomorrow = current.toISOString().split('T')[0];
  get().setActiveDate(tomorrow);
},

navigateToToday: () => {
  const today = new Date().toISOString().split('T')[0];
  get().setActiveDate(today);
},
```

#### 1.2 Update Dashboard Page

**File**: `src/app/page.tsx`

**Remove** hardcoded today (line 50):

```typescript
// DELETE: const today = new Date().toISOString().split('T')[0];
```

**Replace** with activeDate from store (line 38):

```typescript
const {
  profile,
  preferences,
  dailyLog,
  weeklySummary,
  isLoading,
  activeDate, // ADD THIS
  fetchProfile,
  fetchPreferences,
  fetchDailyLog,
  fetchWeeklySummary,
} = useHealthStore();
```

**Update** useEffect (lines 52-65):

```typescript
useEffect(() => {
  // Remove localStorage caching - activeDate is source of truth
  fetchProfile();
  fetchPreferences();
  fetchDailyLog(activeDate); // Use activeDate
  fetchWeeklySummary(activeDate); // Use activeDate
}, [activeDate, fetchProfile, fetchPreferences, fetchDailyLog, fetchWeeklySummary]);
```

#### 1.3 Update Meals Page

**File**: `src/app/meals/page.tsx`

**Remove** hardcoded today (line 25):

```typescript
// DELETE: const today = new Date().toISOString().split('T')[0];
```

**Add** activeDate to destructure (line 18):

```typescript
const { dailyLog, profile, isLoading, activeDate, fetchDailyLog, fetchProfile, addMeal } =
  useHealthStore();
```

**Update** all references from `today` to `activeDate` throughout the file.

#### 1.4 Update Other Pages Using Dates

Repeat the same pattern for:

- `src/app/supplements/page.tsx`
- `src/app/analytics/page.tsx`
- Any other pages that reference daily data

**Pattern**: Replace hardcoded date with `activeDate` from `useHealthStore()`.

---

## 2. Date Navigation & Temporal Clarity UI

### 2.1 Create DateNavigator Component

**File**: `src/components/layout/DateNavigator.tsx` (NEW FILE)

```typescript
'use client';

import { ChevronLeft, ChevronRight, Home, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealthStore } from '@/lib/store/healthStore';
import { format, isToday, parseISO } from 'date-fns';

export function DateNavigator() {
  const { activeDate, navigateToYesterday, navigateToTomorrow, navigateToToday } = useHealthStore();

  const isViewingToday = isToday(parseISO(activeDate));
  const displayDate = format(parseISO(activeDate), 'EEEE, MMM d, yyyy');

  return (
    <div className="flex items-center gap-2">
      {/* Temporal clarity indicator - UNMISTAKABLE when not viewing today */}
      {!isViewingToday && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600">
          <Calendar className="h-4 w-4 text-orange-700 dark:text-orange-300" />
          <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
            Viewing: {displayDate}
          </span>
        </div>
      )}

      {/* Yesterday button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={navigateToYesterday}
        title="Previous day"
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Native HTML date picker */}
      <input
        type="date"
        value={activeDate}
        onChange={(e) => {
          const store = useHealthStore.getState();
          store.setActiveDate(e.target.value);
        }}
        className="h-8 rounded-md border border-input bg-background px-3 text-sm"
        title="Select date"
      />

      {/* Tomorrow button - NEVER disabled */}
      <Button
        variant="ghost"
        size="icon"
        onClick={navigateToTomorrow}
        title="Next day"
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Quick "Today" button - only show when not viewing today */}
      {!isViewingToday && (
        <Button
          variant="default"
          size="sm"
          onClick={navigateToToday}
          className="gap-1.5 h-8"
        >
          <Home className="h-3 w-3" />
          Today
        </Button>
      )}
    </div>
  );
}
```

### 2.2 Update Header Component

**File**: `src/components/layout/Header.tsx`

Import DateNavigator and adjust layout:

```typescript
import { DateNavigator } from './DateNavigator';

// Update header layout (around line 15-25):
<header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
  <div className="flex items-center gap-4">
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
      <Menu className="h-5 w-5" />
    </Button>
  </div>

  {/* Center: Date Navigator */}
  <div className="flex-1 flex justify-center">
    <DateNavigator />
  </div>

  {/* Right: Clock (if enabled) */}
  <div className="flex items-center">
    <DateTimeClock />
  </div>
</header>
```

### 2.3 Empty State Handling

**File**: Update dashboard cards to handle empty data gracefully

In `src/app/page.tsx` and dashboard cards, add empty state detection:

```typescript
// If no data for selected date
if (!dailyLog || dailyLog.meals.length === 0 && dailyLog.supplements.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">No data for this date</h3>
      <p className="text-sm text-muted-foreground">
        No meals or supplements logged on this date
      </p>
    </div>
  );
}
```

---

## 3. Hydration Tracking - Enable/Disable Toggle & Dynamic Weighting

### 3.1 Database Migration

**File**: `src/lib/database/migrations/015_hydration_tracking.sql` (NEW FILE)

```sql
-- Add hydration_enabled to user_preferences table
ALTER TABLE user_preferences ADD COLUMN hydration_enabled INTEGER DEFAULT 0;

-- Add hydration_ml column to daily_summary for future hydration data
ALTER TABLE daily_summary ADD COLUMN hydration_ml REAL DEFAULT 0;
```

### 3.2 Update Preferences Types

**File**: `src/lib/types/preferences.ts`

Add to UserPreferences interface:

```typescript
hydrationEnabled: boolean;
```

Add to PreferencesUpdateInput:

```typescript
hydrationEnabled?: boolean;
```

### 3.3 Update Preferences Repository

**File**: `src/lib/database/repositories/preferencesRepository.ts`

Add `hydration_enabled` to:

- SELECT query (read mapping: `hydrationEnabled: row.hydration_enabled === 1`)
- UPDATE query (write mapping: `hydration_enabled: updates.hydrationEnabled ? 1 : 0`)

### 3.4 Refactor Health Scoring with Dynamic Weights

**File**: `src/lib/utils/healthScoring.ts`

**Update function signature** (line 20):

```typescript
export function calculateHealthScore(
  actual: NutritionalValues,
  targets: NutritionalTargets,
  dailyLog: DailyLog,
  hydrationEnabled: boolean // NEW PARAMETER
): HealthScoreBreakdown;
```

**Replace hardcoded weights** (lines 25-39):

```typescript
// Calculate individual component scores (0-100 scale)
const macroScore = calculateMacroAdherence(actual, targets);
const microScore = calculateMicroAdherence(actual, targets);
const supplementScore = calculateSupplementCompliance(dailyLog);
const hydrationScore = dailyLog.notes ? 10 : 5; // Placeholder

// Build enabled categories array
const enabledCategories = [
  { name: 'macros', score: macroScore },
  { name: 'micros', score: microScore },
  { name: 'supplements', score: supplementScore },
];

// Only include hydration if enabled
if (hydrationEnabled) {
  enabledCategories.push({ name: 'hydration', score: hydrationScore });
}

// Dynamic weight: 1 / N (where N = number of enabled categories)
const weight = 1 / enabledCategories.length;

// Calculate weighted total
const total = enabledCategories.reduce((sum, cat) => sum + cat.score * weight, 0);

return {
  total: Math.round(Math.min(100, Math.max(0, total))),
  macros: Math.round(macroScore),
  micros: Math.round(microScore),
  supplements: Math.round(supplementScore),
  hydration: Math.round(hydrationScore),
};
```

### 3.5 Update Daily Summary Repository

**File**: `src/lib/database/repositories/dailySummaryRepository.ts`

Update `getDailySummary()` to:

1. Fetch user preferences
2. Pass `preferences.hydrationEnabled` to `calculateHealthScore()`

Around the line where calculateHealthScore is called, add:

```typescript
const preferencesRepo = new PreferencesRepository();
const preferences = preferencesRepo.getPreferences();

const healthScoreBreakdown = calculateHealthScore(
  totalNutrition,
  profile.targets,
  { ...dailyLog }, // partial DailyLog
  preferences.hydrationEnabled // NEW PARAMETER
);
```

### 3.6 Update API Route

**File**: `src/app/api/daily-summary/[date]/route.ts`

Ensure preferences are fetched and passed to repository (likely already handled if repository fetches internally).

### 3.7 Add Hydration Toggle to Settings

**File**: `src/app/settings/page.tsx`

Add toggle in the Display & Interface section (around line 80-100):

```typescript
{/* Hydration Tracking Toggle */}
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Enable Hydration Tracking</Label>
    <p className="text-xs text-muted-foreground">
      Track daily water intake and include it in health score calculation.
      History will reflect this setting at the time.
    </p>
  </div>
  <Switch
    checked={localSettings.hydrationEnabled ?? false}
    onCheckedChange={(checked) => {
      setLocalSettings({ ...localSettings, hydrationEnabled: checked });
    }}
  />
</div>
```

**Note**: Users can freely enable/disable. Historical scores will be calculated based on the preference setting at the time of that day's data.

---

## 4. USDA Search UX Improvement

### File: `src/components/forms/FoodSearchInput.tsx`

**Modify empty state logic** (lines 125-135):

Replace the `CommandEmpty` section with:

```typescript
{!isSearching &&
  !usdaSearchLoading &&
  results.length === 0 &&
  query.length > 1 &&
  !usdaSearchError &&
  searchMode === 'local' && (
    <CommandGroup>
      <CommandItem
        value="usda-search-suggestion"
        onSelect={() => {
          // Switch to USDA mode - search auto-triggers via useEffect
          setSearchMode('usda');
        }}
        className="cursor-pointer hover:bg-accent"
      >
        <Database className="mr-2 h-4 w-4 text-blue-500" />
        <span className="text-blue-600 dark:text-blue-400 font-medium">
          Search USDA Database for &quot;{query}&quot;
        </span>
      </CommandItem>
    </CommandGroup>
  )}

{/* Keep existing empty state for USDA mode */}
{!isSearching &&
  !usdaSearchLoading &&
  results.length === 0 &&
  query.length > 1 &&
  !usdaSearchError &&
  searchMode === 'usda' && (
    <CommandEmpty>No foods found in USDA database.</CommandEmpty>
  )}
```

**Logic**: When local search returns 0 results, show clickable suggestion. Clicking switches to USDA mode, which triggers automatic re-search via the existing useEffect (line 35).

---

## 5. Profile Name Field

### File: `src/app/profile/page.tsx`

**Add displayName to form state** (around line 38):

```typescript
const [formData, setFormData] = useState({
  displayName: profile.displayName || '', // ADD THIS
  age: profile.age,
  gender: profile.gender,
  weight: profile.weight,
  height: profile.height,
  activityLevel: profile.activityLevel,
});
```

**Add Personal Information card** (before Physical Metrics card, around line 100):

```typescript
<Card>
  <CardHeader>
    <div className="flex items-center gap-2">
      <User className="h-5 w-5 text-primary" />
      <CardTitle>Personal Information</CardTitle>
    </div>
    <CardDescription>Your display name shown on the dashboard</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="displayName">Display Name</Label>
      <Input
        id="displayName"
        type="text"
        placeholder="Enter your name"
        value={formData.displayName}
        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
      />
      <p className="text-xs text-muted-foreground">
        Used in dashboard greetings and personalized messages
      </p>
    </div>
  </CardContent>
</Card>
```

**Backend support**: Already exists - `profileRepository.ts` handles `display_name` field (lines 25, 50, 61).

---

## 6. Verification - Already Implemented Features

### 6.1 Health Trends Card

**Status**: ✅ Already implemented as `WeeklyTrendChart`
**Location**: `src/components/dashboard/WeeklyTrendChart.tsx`
**Action**: Verify it displays on dashboard - no changes needed

### 6.2 Settings Page

**Status**: ✅ Already fully implemented
**Location**: `src/app/settings/page.tsx`
**Action**: Add hydration toggle only (see section 3.7)

---

## Implementation Order (Step-by-Step)

### Phase 1: Critical Bug Fix (30 min)

1. Add activeDate state to healthStore.ts
2. Update page.tsx (dashboard) to use activeDate
3. Update meals/page.tsx to use activeDate
4. Test: Navigate between Dashboard and Meals - verify date consistency

### Phase 2: Date Navigation UI (20 min)

5. Create DateNavigator.tsx component
6. Update Header.tsx to include DateNavigator
7. Test: Navigate to yesterday, tomorrow, pick date via input
8. Verify: Orange badge appears when not viewing today

### Phase 3: Hydration Weighting (25 min)

9. Create migration 015_hydration_tracking.sql
10. Update preferences types and repository
11. Refactor healthScoring.ts for dynamic weights
12. Update dailySummaryRepository to pass hydrationEnabled
13. Add hydration toggle to settings page
14. Test: Toggle hydration on/off, verify score recalculates

### Phase 4: USDA & Profile (15 min)

15. Update FoodSearchInput.tsx for clickable USDA suggestion
16. Add display name field to profile page
17. Test: Search for non-existent food, click USDA suggestion
18. Test: Save display name, verify dashboard greeting

### Total Estimated Time: 90 minutes

---

## Critical Files Modified

### Core State Management:

- `src/lib/store/healthStore.ts` - Add activeDate state and navigation actions
- `src/lib/utils/healthScoring.ts` - Dynamic weight calculation

### UI Components:

- `src/components/layout/DateNavigator.tsx` - NEW: Date navigation controls
- `src/components/layout/Header.tsx` - Integrate DateNavigator
- `src/components/forms/FoodSearchInput.tsx` - USDA search suggestion

### Pages:

- `src/app/page.tsx` - Use activeDate instead of hardcoded today
- `src/app/meals/page.tsx` - Use activeDate
- `src/app/profile/page.tsx` - Add display name field
- `src/app/settings/page.tsx` - Add hydration toggle

### Database & Types:

- `src/lib/database/migrations/015_hydration_tracking.sql` - NEW: Hydration preferences
- `src/lib/types/preferences.ts` - Add hydrationEnabled field
- `src/lib/database/repositories/preferencesRepository.ts` - Handle hydration field
- `src/lib/database/repositories/dailySummaryRepository.ts` - Pass hydrationEnabled to scoring

---

## Testing & Verification

### Manual Testing Checklist:

#### Date Navigation & Consistency:

- [ ] Navigate to yesterday - all cards show yesterday's data
- [ ] Navigate to tomorrow - empty state shown (no fallback to today)
- [ ] Switch from Dashboard to Meals - same date preserved
- [ ] Switch from Meals to Supplements - same date preserved
- [ ] Reload page - activeDate resets to today (expected behavior)
- [ ] Orange "Viewing" badge appears when not viewing today
- [ ] Orange badge disappears when viewing today
- [ ] "Today" button appears only when not viewing today
- [ ] Click "Today" button - returns to today's data
- [ ] Tomorrow button is never disabled (can navigate to future)

#### Hydration Weighting:

- [ ] With hydration disabled: Health score uses 3 categories (≈33% each)
- [ ] Enable hydration: Health score immediately recalculates with 4 categories (25% each)
- [ ] Disable hydration again: Score reverts to 3-category weighting
- [ ] Historical dates respect hydration setting at time of view (if disabled now, past dates with hydration enabled still calculated correctly)

#### USDA Search:

- [ ] Search for non-existent food in local mode
- [ ] "Search USDA Database for '{query}'" suggestion appears
- [ ] Click suggestion - automatically switches to USDA mode and searches
- [ ] If no USDA results, shows "No foods found in USDA database"
- [ ] Existing USDA toggle button still works independently

#### Profile Name:

- [ ] Enter display name in profile page
- [ ] Save profile
- [ ] Dashboard shows personalized greeting with name
- [ ] Name persists across page refreshes

#### Empty States:

- [ ] Future dates with no data: Shows "No data for this date" message
- [ ] Past dates with no data: Shows same message
- [ ] Never shows yesterday's data as fallback

---

## Edge Cases & Considerations

### Date Handling:

- **Timezone**: All dates use ISO format (YYYY-MM-DD) in local timezone
- **Date Boundaries**: Navigation handles month/year boundaries correctly via date-fns
- **Invalid Dates**: Native date input prevents invalid date selection

### State Persistence:

- **Page Reload**: activeDate resets to today (by design - user constraint)
- **Browser Back/Forward**: Standard Next.js routing, activeDate persists in Zustand
- **localStorage**: Remove dashboard date caching to avoid conflicts

### Health Scoring:

- **Empty Supplements**: If no enabled supplements, supplement score = 100 (existing logic)
- **Hydration Disabled**: Score calculated from 3 categories, hydration score still returned in breakdown for UI display
- **Division by Zero**: Impossible - at least 3 categories always enabled (macros, micros, supplements)

### Performance:

- **Date Navigation**: Single API call to fetch daily summary for new date
- **Score Recalculation**: Happens server-side in repository, returned in API response
- **USDA Search**: Debounced (300ms) to avoid excessive API calls

---

## Dependencies

### Required:

- `date-fns` - Already installed (used for date formatting)
- Native HTML `<input type="date">` - No additional dependencies

### Not Required:

- ~~shadcn Calendar component~~ - Using native date input per user preference
- ~~React-Day-Picker~~ - Not needed

---

## Success Criteria

1. ✅ Users can navigate to any date (past, present, future)
2. ✅ All pages show consistent date data (no tab switching bug)
3. ✅ Clear visual indicator when not viewing today (orange badge)
4. ✅ Tomorrow button never disabled
5. ✅ Hydration can be toggled on/off freely
6. ✅ Health score weights adjust dynamically (3 or 4 categories)
7. ✅ USDA search suggestion appears when local search empty
8. ✅ Display name field added to profile page
9. ✅ Page reload always defaults to today
10. ✅ Empty dates show appropriate message (no fallback to yesterday)
