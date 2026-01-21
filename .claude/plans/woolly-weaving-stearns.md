# Fix: Monthly Heatmap Incorrectly Calculating Future Days as Missed

## Problem

The Monthly Heatmap on the Calories page is incorrectly counting future days as "missed days" in the summary calculation.

**Current Bug:** Line 157 in `CalendarHeatmap.tsx` calculates:

```typescript
{
  monthlyData.daysTotal - monthlyData.daysMetGoal;
}
```

This counts ALL days in the month (including future days) minus days where the goal was met.

**Example of the Bug:**

- Today: January 20, 2026
- Viewing: January 2026
- daysTotal: 31 (includes future days 21-31)
- daysMetGoal: 15
- **Days Missed shows: 16** (incorrectly including 11 future days that haven't occurred yet)

**Visual Display:** The calendar grid is correct - future days show as gray (no data), past days show green (goal met) or red (goal missed). Only the summary calculation is wrong.

## Solution

Fix the "Days Missed" calculation to only count past/current days where:

- The day is not in the future (date ≤ today)
- Data exists (hasData === true)
- Goal was NOT met (goalMet === false)

This is a frontend-only fix with no backend changes required.

## Implementation Steps

### Step 1: Add Today's Date Calculation

**File:** `src/components/calories/CalendarHeatmap.tsx`

**Location:** After line 32 (after `daysInMonth` declaration)

**Add:**

```typescript
// Get today's date for comparison
const today = new Date();
today.setHours(0, 0, 0, 0);
```

### Step 2: Calculate Actual Days Missed

**File:** `src/components/calories/CalendarHeatmap.tsx`

**Location:** After line 60 (after `calendarDays` array is built)

**Add:**

```typescript
// Calculate days missed (only count past/current days with data that didn't meet goal)
const daysMissed = calendarDays.filter((dayInfo) => {
  if (!dayInfo) return false; // Skip empty cells (days before month starts)

  // Only count days that are today or in the past
  const dayDate = new Date(dayInfo.dateStr);
  dayDate.setHours(0, 0, 0, 0);

  if (dayDate > today) return false; // Skip future days

  // Count days with data where goal was not met
  return dayInfo.hasData && !dayInfo.goalMet;
}).length;
```

### Step 3: Fix the Summary Display

**File:** `src/components/calories/CalendarHeatmap.tsx`

**Location:** Line 157

**Replace:**

```typescript
{
  monthlyData.daysTotal - monthlyData.daysMetGoal;
}
```

**With:**

```typescript
{
  daysMissed;
}
```

## Critical Files

- `src/components/calories/CalendarHeatmap.tsx` - Main fix location (3 small changes)

## Edge Cases Handled

1. **Current Month (e.g., Jan 20, 2026 viewing January):** Only counts days 1-20, ignores days 21-31
2. **Past Month:** All days in the past are counted if they missed the goal
3. **Future Month:** Shows 0 days missed (correct, since no days have occurred)
4. **Days with No Data:** Not counted as missed (hasData check filters these out)
5. **Today:** Included in the count if goal wasn't met

## Expected Behavior After Fix

- **Days Missed** count will match the number of red cells in the calendar grid
- Future days will not contribute to the "Days Missed" count
- When viewing the current month, only past/current days are counted
- The sum of "Days Met Goal" + "Days Missed" will typically be less than "Days Total" because some days may have no data

## Verification

After implementation:

1. **Manual Testing:**
   - Navigate to the Calories page
   - View the current month's heatmap
   - Count the red cells (days where goal was missed)
   - Verify "Days Missed" matches the red cell count
   - Navigate month-by-month (past, current, future) and verify calculations

2. **Test Cases:**
   - Current month with today being mid-month
   - Past month (all days should count)
   - Future month (should show 0 days missed)
   - First/last day of month edge cases
   - Month with no data (should show 0)

3. **Visual Validation:**
   - Red cells on calendar = "Days Missed" number
   - Future days show as gray and are not counted as missed
   - Past days with no data show as gray and are not counted as missed
