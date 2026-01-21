# Calories Page Redesign - Implementation Plan

## Overview

Redesign the Calories page (`src/app/calories/page.tsx`) to improve information hierarchy, combine related components, and add weight tracking functionality. The goal is to create a cleaner, more intuitive layout with better visual flow across daily/weekly/monthly sections.

## User Requirements Summary

### Layout Changes

1. **Remove** debug profile switcher at bottom (moved to admin menu)
2. **Remove** quick links section (Log Meals, Analytics, Dashboard buttons)
3. **Move** Current Goal card from bottom to top, integrated with Today's Progress
4. **Create** new combined Weekly Pace & Streak card
5. **Clean up** WeeklyEncouragementCard (remove projection text, reduce padding)
6. **Add** section dividers for visual hierarchy (Daily → Weekly → Monthly)

### New Features

1. **Weight Tracking System**
   - Add "Quick Check-in" button to hero card
   - Weight check-in modal with:
     - Weight input field
     - Placeholder section: "How are you feeling today?" (future feature)
   - Weight history logging to database
   - Weight progress chart (line chart, last 30 days)

2. **Hero Card (Top)**
   - Full-width card combining Today's Progress + Current Goal info
   - Left side: Pie chart with meals (Breakfast, Lunch, Dinner, **Snacks**)
   - Right side:
     - Goal type badge with Edit button
     - Pace indicator: "On pace for 370 cal deficit - on track to lose 1.8 lbs this week"
     - Activity level
     - Current weight display
     - "Quick Check-in" button

3. **Weekly Pace & Streak Card**
   - Replace separate stat cards and streak card with unified component
   - **Weekly Pace Section:**
     - Week progress indicator (e.g., "Week 4 of 52")
     - Progress bar: "54% through the week"
     - Deficit/Surplus display: "On pace for 370 cal deficit"
     - Pace text: "On track to lose 1.8 lbs this week" (weight_loss) / "On track to maintain weight" (maintenance) / "On track to gain 2.1 lbs" (gain)
     - Hover tooltip with detailed numbers (consumed, target, difference)
   - **Streak Section (integrated):**
     - Current streak + Best streak
     - Days met goal this week (e.g., "5 out of 7 days on target")
     - Motivational message

## Critical Files to Modify

### Components

- `src/components/calories/CalorieProgressCard.tsx` (reference for pie chart logic)
- `src/components/calories/WeeklyEncouragementCard.tsx` (clean up: remove lines 94-99, reduce padding)
- `src/components/calories/CalorieStreakCard.tsx` (reference for streak logic)
- `src/app/calories/page.tsx` (main page layout reorganization)

### New Components to Create

- `src/components/calories/HeroCalorieCard.tsx` (combined hero card)
- `src/components/calories/WeeklyPaceStreakCard.tsx` (new combined component)
- `src/components/calories/WeightCheckInModal.tsx` (weight logging modal)
- `src/components/calories/WeightProgressChart.tsx` (line chart for weight over time)

### Database & API

- Create migration: `src/lib/database/migrations/005_add_weight_logs.ts`
- Create repository: `src/lib/database/repositories/weightLogRepository.ts`
- Create API routes:
  - `src/app/api/weight-logs/route.ts` (GET all, POST new)
  - `src/app/api/weight-logs/latest/route.ts` (GET latest weight)
- Create types: Add to `src/lib/types/weight.ts` (new file)

## Implementation Steps

### Phase 1: Database & Backend (Weight Tracking)

#### 1.1 Create Weight Logs Database Schema

**File**: `src/lib/database/migrations/005_add_weight_logs.ts`

```sql
CREATE TABLE IF NOT EXISTS weight_logs (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  weight REAL NOT NULL,
  date TEXT NOT NULL, -- ISO 8601 date (YYYY-MM-DD)
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
  UNIQUE(profile_id, date) -- One entry per day
);

CREATE INDEX idx_weight_logs_profile_date ON weight_logs(profile_id, date DESC);
```

**Migration Runner**: Update `src/lib/database/connection.ts` to run migration 005.

#### 1.2 Create Weight Log Repository

**File**: `src/lib/database/repositories/weightLogRepository.ts`

Methods:

- `logWeight(profileId: string, weight: number, date: string, notes?: string): WeightLog`
- `getWeightHistory(profileId: string, startDate?: string, endDate?: string): WeightLog[]`
- `getLatestWeight(profileId: string): WeightLog | null`
- `getWeightForDate(profileId: string, date: string): WeightLog | null`
- `deleteWeightLog(id: string): void`

#### 1.3 Create TypeScript Types

**File**: `src/lib/types/weight.ts`

```typescript
export interface WeightLog {
  id: string;
  profileId: string;
  weight: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface WeightLogRequest {
  weight: number;
  date?: string; // defaults to today
  notes?: string;
}

export interface WeightProgressData {
  logs: WeightLog[];
  startWeight: number | null;
  currentWeight: number | null;
  weightChange: number; // positive = gained, negative = lost
  trend: 'up' | 'down' | 'stable';
}
```

#### 1.4 Create Weight Logs API Routes

**File**: `src/app/api/weight-logs/route.ts`

- **GET**: Return weight history (query params: `startDate`, `endDate`, default last 30 days)
- **POST**: Log new weight entry (body: `WeightLogRequest`)

**File**: `src/app/api/weight-logs/latest/route.ts`

- **GET**: Return latest weight log (used for hero card display)

### Phase 2: Weight Tracking UI Components

#### 2.1 Weight Check-In Modal

**File**: `src/components/calories/WeightCheckInModal.tsx`

**Props**:

- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `currentWeight: number | null` (from profile or latest log)
- `onSuccess?: () => void` (callback after successful save)

**UI Structure**:

- shadcn/ui Dialog component
- Number input for weight (with unit label: "lbs")
- Date picker (defaults to today)
- Placeholder section: "How are you feeling today?" (text label only, no input yet)
- Save & Cancel buttons
- On save: POST to `/api/weight-logs`, show success toast, close modal, trigger callback

#### 2.2 Weight Progress Chart

**File**: `src/components/calories/WeightProgressChart.tsx`

**Props**:

- `logs: WeightLog[]`
- `goalType: GoalType` (for context coloring)

**Features**:

- Recharts LineChart showing weight over time (X: date, Y: weight)
- Last 30 days of data by default
- Show trend line (optional moving average)
- Color coding: green (weight_loss + losing), red (weight_loss + gaining), blue (maintenance), etc.
- Stats below chart: Starting weight, Current weight, Change (+/- lbs)

### Phase 3: Hero Card Component

#### 3.1 Create Hero Calorie Card

**File**: `src/components/calories/HeroCalorieCard.tsx`

**Props**:

- `tracking: DailyCalorieTracking`
- `currentGoal: CalorieGoal`
- `weeklyTracking: WeeklyProgressData`
- `currentWeight: number | null`
- `onWeightCheckIn: () => void` (opens weight modal)
- `onEditGoal: () => void` (opens goal modification modal)

**Layout**: Full-width Card with 2-column grid

**Left Column**:

- Reuse pie chart logic from `CalorieProgressCard.tsx`
- Show meal breakdown: Breakfast 🍳, Lunch 🍕, Dinner 🍝, Snacks 🍿
- Display consumed / target calories
- Show remaining calories

**Right Column**:

- Goal type badge (🎯 Weight Loss Goal / 🏃 Maintenance Goal / 💪 Weight Gain Goal) + Edit button
- **Pace indicator** (dynamic based on goal type):
  - Weight Loss: "📊 On pace for 370 cal deficit - You're on track to lose 1.8 lbs this week"
  - Maintenance: "📊 On pace to maintain weight - You're keeping steady!"
  - Gain: "📊 On pace for 420 cal surplus - You're on track to gain 2.1 lbs this week"
  - Hover tooltip: "Weekly consumed: X cal | Weekly target: Y cal | Difference: ±Z cal"
- Activity level: "⚡ Activity Level: Moderate"
- Current weight: "⚖️ Current Weight: 185 lbs"
- Button: "Quick Check-in" (opens WeightCheckInModal)

**Calculations**:

- Weekly deficit/surplus: `weeklyTracking.weeklyTarget - weeklyTracking.weeklyConsumed`
- Projected weight change: `Math.abs(weeklyDeficitSurplus) / 3500` (3500 cal = 1 lb)

### Phase 4: Weekly Pace & Streak Card

#### 4.1 Create Combined Component

**File**: `src/components/calories/WeeklyPaceStreakCard.tsx`

**Props**:

- `weeklyTracking: WeeklyProgressData`
- `streakInfo: StreakInfo`
- `goalType: GoalType`

**Layout**: Single Card with two sections

**Top Section - Weekly Pace**:

- Week indicator: "Week 4 of 52" (calculate from start date)
- Progress bar: visual representation of week progress (Day 1-7)
- Percentage: "54% through the week"
- **Deficit/Surplus display** (no "end at X calories" text):
  - Weight Loss: "On pace for 370 cal deficit"
  - Maintenance: "On pace to maintain" (or "slight deficit/surplus of X cal")
  - Gain: "On pace for 420 cal surplus"
- Pace text: Goal-specific encouragement
- Hover tooltip with detailed breakdown

**Bottom Section - Streak**:

- Current streak: X days | Best: Y days
- Visual indicator: Fire emojis or progress dots
- "5 out of 7 days on target this week"
- Motivational message from `CalorieStreakCard` logic

**Styling**: Use subtle border or background color to separate the two sections

### Phase 5: Clean Up Existing Components

#### 5.1 Update Weekly Encouragement Card

**File**: `src/components/calories/WeeklyEncouragementCard.tsx`

**Changes**:

- Remove lines 94-99 (projection text: "At this pace, you're projected to end the week at...")
- Change `pt-6` to `pt-4` at line 85 (reduce top padding)
- Keep motivational message and colored background logic

#### 5.2 Add Section Dividers

Create utility component or use simple dividers:

**File**: `src/components/calories/SectionDivider.tsx` (optional)

```tsx
interface SectionDividerProps {
  title: string;
  icon?: React.ReactNode;
}

export function SectionDivider({ title, icon }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-2 my-8">
      {icon}
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent ml-4" />
    </div>
  );
}
```

### Phase 6: Page Layout Reorganization

#### 6.1 Update Calories Page

**File**: `src/app/calories/page.tsx`

**New Layout Order**:

```tsx
// Header
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <Flame className="h-8 w-8 text-orange-500" />
    <h1 className="text-3xl font-bold">Calorie Tracker</h1>
  </div>
  <Button asChild>
    <Link href="/meals">Log Meals</Link>
  </Button>
</div>

// === DAILY SECTION (no explicit divider) ===
<HeroCalorieCard
  tracking={todayTracking}
  currentGoal={currentGoal}
  weeklyTracking={weeklyTracking}
  currentWeight={latestWeight}
  onWeightCheckIn={() => setWeightCheckInOpen(true)}
  onEditGoal={() => setGoalModificationOpen(true)}
/>

<WeightProgressChart logs={weightLogs} goalType={currentGoal.goalType} />

// === THIS WEEK SECTION ===
<SectionDivider title="This Week" icon={<TrendingUp />} />

<WeeklyPaceStreakCard
  weeklyTracking={weeklyTracking}
  streakInfo={streakInfo}
  goalType={currentGoal.goalType}
/>

<WeeklyProgressChart data={weeklyTracking} goalType={currentGoal.goalType} />

<WeeklyEncouragementCard weeklyData={weeklyTracking} goalType={currentGoal.goalType} />

// === THIS MONTH SECTION ===
<SectionDivider title="This Month" icon={<Calendar />} />

<CalendarHeatmap
  monthlyData={monthlyData}
  onMonthChange={(year, month) => setCurrentMonth({ year, month })}
/>

<MonthlyTrendChart data={monthlyData} />

<TrendAnalysisCard monthlyData={monthlyData} />

// === GOAL HISTORY (conditional) ===
{goalHistory.length > 0 && (
  <>
    <SectionDivider title="Goal History" icon={<History />} />
    <GoalHistoryTimeline history={goalHistory} />
  </>
)}

// REMOVED: Debug panel
// REMOVED: Quick links section
// REMOVED: Current Goal card at bottom
```

#### 6.2 Add State for Weight Tracking

Add to `CaloriesPage` component:

- `const [weightCheckInOpen, setWeightCheckInOpen] = useState(false)`
- `const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])`
- `const [latestWeight, setLatestWeight] = useState<number | null>(null)`

Add fetch functions:

- `fetchWeightLogs()` - Fetch last 30 days on mount
- `fetchLatestWeight()` - Fetch current weight for hero card

#### 6.3 Add Weight Check-In Modal

```tsx
<WeightCheckInModal
  open={weightCheckInOpen}
  onOpenChange={setWeightCheckInOpen}
  currentWeight={latestWeight}
  onSuccess={() => {
    fetchWeightLogs();
    fetchLatestWeight();
  }}
/>
```

### Phase 7: Styling & Polish

#### 7.1 Visual Hierarchy

- Use consistent spacing: `space-y-6` between major sections
- Section dividers with gradient lines
- Card shadows: Subtle elevation for hero card vs. standard cards

#### 7.2 Responsive Design

- Hero card: 2 columns on desktop, stack on mobile
- Stat grids: Adjust columns for mobile (2 cols → 1 col)
- Charts: ResponsiveContainer for all Recharts components

#### 7.3 Loading States

- Skeleton loaders for hero card while data fetches
- Loading spinner for weight chart
- Disable "Quick Check-in" button if weight data is loading

## Data Flow

### Weight Logging Flow

1. User clicks "Quick Check-in" on hero card
2. `WeightCheckInModal` opens with current weight pre-filled
3. User enters new weight (and optional date/notes)
4. Modal calls `POST /api/weight-logs`
5. API route validates and saves to `weight_logs` table via repository
6. On success: Show toast, update profile weight (if today), close modal
7. Parent component refetches weight data
8. `WeightProgressChart` updates with new data point

### Pace Calculation Flow

1. `weeklyTracking.weeklyConsumed` and `weeklyTracking.weeklyTarget` from store
2. Calculate: `deficitSurplus = weeklyTarget - weeklyConsumed`
3. Calculate: `projectedWeightChange = Math.abs(deficitSurplus) / 3500`
4. Display based on `goalType`:
   - `weight_loss`: Show deficit and "lose X lbs"
   - `maintenance`: Show "maintaining" or small deficit/surplus
   - `gain`: Show surplus and "gain X lbs"

## Testing Plan

### Manual Testing

1. **Hero Card**:
   - Verify pie chart shows all 4 meal types (Breakfast, Lunch, Dinner, Snacks)
   - Check pace indicator text matches goal type
   - Hover over pace to see detailed tooltip
   - Click Edit button → Goal modification modal opens
   - Click Quick Check-in → Weight modal opens

2. **Weight Check-In Modal**:
   - Enter weight and save → Success toast appears
   - Verify weight saves to database (check admin or API response)
   - Verify modal closes on save
   - Verify weight chart updates after save

3. **Weight Progress Chart**:
   - Log multiple weights on different dates
   - Verify line chart displays correctly
   - Check trend direction (up/down/stable)
   - Verify stats below chart are accurate

4. **Weekly Pace & Streak Card**:
   - Verify week progress percentage is correct
   - Check deficit/surplus displays correct value
   - Verify pace text matches goal type (no "end at X calories")
   - Check streak data displays correctly
   - Verify "X out of 7 days on target" is accurate

5. **Page Layout**:
   - Verify debug panel is removed
   - Verify quick links are removed
   - Verify Current Goal card is no longer at bottom
   - Check section dividers appear ("This Week", "This Month")
   - Verify WeeklyEncouragementCard has reduced padding and no projection text

6. **Responsive Design**:
   - Test on mobile viewport (hero card stacks vertically)
   - Test on tablet and desktop (all layouts render correctly)

### Edge Cases

- No weight logs yet → Chart shows empty state with message
- No streak data → Streak section shows "Start logging" message
- First day of week → Week progress shows 0-14%
- Goal type changes → All pace indicators update correctly
- Over/under target → Colors and messages adjust appropriately

## Verification Checklist

### Database

- [ ] Migration 005 runs successfully
- [ ] `weight_logs` table created with correct schema
- [ ] Indexes created for performance
- [ ] Foreign key constraint works (delete cascade)

### API

- [ ] GET `/api/weight-logs` returns last 30 days
- [ ] POST `/api/weight-logs` saves new entry
- [ ] GET `/api/weight-logs/latest` returns most recent weight
- [ ] Validation works (no negative weights, valid dates)
- [ ] Error handling for duplicate entries (same date)

### Components

- [ ] `HeroCalorieCard` renders with all sections
- [ ] Pie chart includes Snacks meal type
- [ ] Pace indicator text is goal-specific (no maintenance numbers)
- [ ] Hover tooltip shows detailed calorie breakdown
- [ ] `WeightCheckInModal` opens/closes correctly
- [ ] Weight input accepts decimal values (e.g., 185.5)
- [ ] `WeightProgressChart` displays line chart with data
- [ ] `WeeklyPaceStreakCard` shows combined pace + streak info
- [ ] Section dividers render between major sections

### Page Layout

- [ ] Hero card at top of page
- [ ] Weight chart directly below hero
- [ ] Section dividers before "This Week" and "This Month"
- [ ] `WeeklyEncouragementCard` cleaned up (no projection text, less padding)
- [ ] Debug panel removed
- [ ] Quick links section removed
- [ ] Current Goal card removed from bottom

### Styling

- [ ] Visual hierarchy is clear (Daily → Weekly → Monthly)
- [ ] Spacing is consistent (`space-y-6` between sections)
- [ ] Cards have appropriate elevation/shadows
- [ ] Colors match design system (green/blue/purple)
- [ ] Mobile responsive (hero card stacks, charts resize)

## Notes for Implementation

- **Desktop-first**: Build for desktop layout first, add mobile responsive tweaks later
- **Reuse logic**: Borrow pie chart and meal fetching logic from existing `CalorieProgressCard`
- **Type safety**: Ensure all new components have proper TypeScript interfaces
- **Error handling**: Add try-catch in all API calls, show user-friendly toast messages
- **Loading states**: Use skeleton loaders from shadcn/ui for better UX
- **Hover tooltips**: Use Radix UI Tooltip primitive for detailed calorie breakdown
- **Future placeholder**: "How are you feeling today?" section in weight modal is just a label (no functionality yet)
- **3500 calorie rule**: 1 lb body weight = 3500 calories (used for all weight projections)

## Future Enhancements (Out of Scope)

- Separate Weight Tracking page with more detailed analytics
- "How are you feeling today?" mood tracking functionality
- Weight goal setting (target weight, timeline)
- Body composition tracking (body fat %, muscle mass)
- Progress photos feature
- Export weight data to CSV
- Weight prediction model based on intake trends
