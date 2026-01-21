# Meals Page Overhaul - Implementation Plan

## Summary

Transform the meals page from a simple form/list layout into a comprehensive meal tracking experience with visual progress indicators, organized meal sections, historical data, and convenience features.

## User Requirements Captured

- **Log Meal Modal**: Convert card to modal, unified for add/edit
- **Hero Header**: Macros wheel + Micros wheel (nested vitamins/minerals rings) + segmented calorie bar (20 segments, red overflow)
- **Inline target editing**: Click to edit calorie/macro targets directly
- **Today's Meals**: Emoji headers, collapsible sections, per-meal calorie contribution bars, inline qty edit + full edit
- **Historical Log**: Rolling 7 days, collapsible card, View Details modal
- **Convenience Features**: Copy previous meal, favorite meals, recent foods quick-add

---

## Phase 1: Data Layer Foundation

### 1.1 Create Meal Update API Route

**Create**: `src/app/api/meals/[id]/route.ts`

- GET: Fetch single meal by ID
- PUT: Update meal (foods array, recalculate totalNutrition)
- Pattern: Follow existing `src/app/api/meals/route.ts`

### 1.2 Add updateMeal to Health Store

**Modify**: `src/lib/store/healthStore.ts`

```typescript
updateMeal: async (
  id: string,
  updates: { foods?: Array<{ foodId; foodName; amount }>; mealType?: string }
) => Promise<void>;
```

### 1.3 Install Collapsible Component

```bash
npx shadcn@latest add collapsible
```

---

## Phase 2: Meal Log Modal

### 2.1 Create MealLogModal Component

**Create**: `src/components/meals/MealLogModal.tsx`

- Props: `isOpen`, `onClose`, `editMeal?: MealLog`, `defaultMealType?`
- Reuse logic from `src/components/forms/MealLogForm.tsx`
- Dynamic title: "Log a Meal" vs "Edit Meal"
- Dynamic button: "Log Meal" vs "Update Meal"
- On edit mode: pre-populate meal type and foods with amounts

### 2.2 Update MealLogForm (optional keep for dashboard)

**Modify**: `src/components/forms/MealLogForm.tsx`

- Extract shared logic to a hook or keep as standalone

---

## Phase 3: Hero Header with Visualizations

### 3.1 Create MealsHeroHeader Component

**Create**: `src/components/meals/MealsHeroHeader.tsx`

- Layout: Title + subtitle + "Log Meal" button
- Contains MacrosRadialWheel, MicrosRadialWheel, SegmentedCalorieBar
- Responsive: wheels side-by-side on desktop, stacked on mobile

### 3.2 Create MacrosRadialWheel Component

**Create**: `src/components/meals/MacrosRadialWheel.tsx`

- Recharts PieChart with innerRadius/outerRadius (donut)
- 3 segments: Protein (blue), Carbs (orange), Fat (yellow)
- Shows actual grams + % of target in center/tooltip
- Pattern: Follow `src/components/dashboard/MacroChart.tsx`

### 3.3 Create MicrosRadialWheel Component

**Create**: `src/components/meals/MicrosRadialWheel.tsx`

- Two concentric rings using Recharts RadialBarChart or nested Pie
- Outer ring: Average vitamin completion % (13 vitamins from `VITAMINS`)
- Inner ring: Average mineral completion % (14 minerals from `MINERALS`)
- Calculate: `sum(actual/target) / count` for each category
- Color: Green >=100%, Yellow 50-99%, Red <50%

### 3.4 Create SegmentedCalorieBar Component

**Create**: `src/components/meals/SegmentedCalorieBar.tsx`

- 20 segments using CSS grid (`grid-cols-20` or flex)
- Each segment = 5% of calorie target
- Fill logic:
  - Segments 1-20: Green fill for consumed %
  - If >100%: Additional segments turn red/orange
- Clickable target label opens inline input for editing
- Props: `actual`, `target`, `onTargetChange`

### 3.5 Create InlineEditableTarget Component

**Create**: `src/components/meals/InlineEditableTarget.tsx`

- Click to switch from display to input mode
- Enter/blur to save
- Calls profile update API

---

## Phase 4: Today's Meals Section

### 4.1 Create TodaysMealsList Component

**Create**: `src/components/meals/TodaysMealsList.tsx`

- Groups meals by type: breakfast, lunch, dinner, snack
- Renders 4 MealTypeSection components
- Calculates per-section totals

### 4.2 Create MealTypeSection Component

**Create**: `src/components/meals/MealTypeSection.tsx`

- Uses shadcn Collapsible component
- Header: Emoji + Title + Macros summary + Calories + Expand icon
  - Emojis: Breakfast, Lunch, Dinner, Snack
- Default expanded if has meals, collapsed if empty
- Each meal row shows:
  - MealCalorieSegmentBar (contribution to daily total)
  - Food list with inline quantity inputs
  - Actions: Edit (opens modal), Delete (confirm dialog), Copy, Inspect

### 4.3 Create MealCalorieSegmentBar Component

**Create**: `src/components/meals/MealCalorieSegmentBar.tsx`

- Small horizontal bar showing meal's % of daily calories
- Single color based on meal type
- Compact: 100px wide, 8px tall

### 4.4 Add Inline Quantity Edit

- In MealTypeSection, food amounts are editable inputs
- On blur/enter: call `updateMeal` with new amount
- Shows loading state during save

---

## Phase 5: Historical Log

### 5.1 Create HistoricalLogCard Component

**Create**: `src/components/meals/HistoricalLogCard.tsx`

- Collapsible Card (default collapsed)
- Title: "Weekly History" with expand/collapse
- Fetches last 7 days via `fetchWeeklySummary()`
- Table: Date | Calories | Protein | Carbs | Fat | Actions
- "View Details" button per row

### 5.2 Create DayDetailModal Component

**Create**: `src/components/meals/DayDetailModal.tsx`

- Shows full breakdown for a historical day
- Sections: Meals list, Supplements taken, Total nutrition
- Similar to dashboard daily summary view

---

## Phase 6: Convenience Features

### 6.1 Copy Previous Meal

- Add "Copy" button in MealTypeSection meal actions
- Creates new meal with same foods for today
- Calls `addMeal()` with copied data
- Toast: "Meal copied to today"

### 6.2 Favorite Meals System

**Create migration**: `src/lib/database/migrations/004_add_meal_favorites.sql`

```sql
CREATE TABLE IF NOT EXISTS meal_favorites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  foods TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

**Create**: `src/lib/database/repositories/mealFavoritesRepository.ts`

- `addFavorite(name, mealType, foods)`
- `getFavorites()`
- `deleteFavorite(id)`

**Create**: `src/app/api/meals/favorites/route.ts`

- GET, POST, DELETE handlers

**Create**: `src/components/meals/FavoriteMealsSection.tsx`

- Horizontal scrollable list of saved favorites
- Click to quick-log (opens modal pre-populated)
- Star icon on meals to save as favorite

### 6.3 Recent Foods Quick-Add

**Modify**: `src/lib/database/repositories/mealLogRepository.ts`

- Add `getRecentFoods(limit: number)` method
- Query distinct foods from recent meals, ordered by frequency

**Create**: `src/app/api/foods/recent/route.ts`

- Returns last 10 unique foods logged

**Modify**: `src/components/meals/MealLogModal.tsx` (or FoodSearchInput)

- Show "Recent" section above search results
- Horizontal chips for quick selection

---

## Phase 7: Page Integration & Polish

### 7.1 Restructure Meals Page

**Modify**: `src/app/meals/page.tsx`

```tsx
<MealsHeroHeader />           // Hero with wheels + calorie bar
<FavoriteMealsSection />      // Quick-add favorites
<TodaysMealsList />           // Organized meal sections
<HistoricalLogCard />         // Collapsible 7-day history
<MealLogModal />              // Modal (controlled by state)
```

### 7.2 Update MealsSkeleton

**Modify**: `src/components/meals/MealsSkeleton.tsx`

- Match new layout with placeholder shapes

### 7.3 Responsive Design

- Hero wheels stack vertically on mobile
- Meal sections full-width on mobile
- Touch-friendly collapse/expand

---

## Files Summary

### New Files (17)

| File                                                       | Purpose                      |
| ---------------------------------------------------------- | ---------------------------- |
| `src/app/api/meals/[id]/route.ts`                          | PUT/GET for meal updates     |
| `src/app/api/meals/favorites/route.ts`                     | Favorites CRUD               |
| `src/app/api/foods/recent/route.ts`                        | Recent foods endpoint        |
| `src/components/meals/MealLogModal.tsx`                    | Unified add/edit modal       |
| `src/components/meals/MealsHeroHeader.tsx`                 | Hero section                 |
| `src/components/meals/MacrosRadialWheel.tsx`               | Macro donut chart            |
| `src/components/meals/MicrosRadialWheel.tsx`               | Nested vitamin/mineral rings |
| `src/components/meals/SegmentedCalorieBar.tsx`             | 20-segment progress bar      |
| `src/components/meals/InlineEditableTarget.tsx`            | Click-to-edit target         |
| `src/components/meals/TodaysMealsList.tsx`                 | Meal sections container      |
| `src/components/meals/MealTypeSection.tsx`                 | Collapsible meal type        |
| `src/components/meals/MealCalorieSegmentBar.tsx`           | Per-meal contribution bar    |
| `src/components/meals/HistoricalLogCard.tsx`               | 7-day history card           |
| `src/components/meals/DayDetailModal.tsx`                  | Historical day detail        |
| `src/components/meals/FavoriteMealsSection.tsx`            | Favorites quick-add          |
| `src/lib/database/repositories/mealFavoritesRepository.ts` | Favorites data access        |
| `src/lib/database/migrations/004_add_meal_favorites.sql`   | Favorites table              |

### Modified Files (4)

| File                                                 | Changes                 |
| ---------------------------------------------------- | ----------------------- |
| `src/app/meals/page.tsx`                             | Complete restructure    |
| `src/lib/store/healthStore.ts`                       | Add `updateMeal` action |
| `src/lib/database/repositories/mealLogRepository.ts` | Add `getRecentFoods`    |
| `src/components/meals/MealsSkeleton.tsx`             | Match new layout        |

---

## Verification Plan

### Manual Testing

1. **Log Meal Modal**: Open modal, add foods, log meal, verify appears in list
2. **Edit Meal**: Click edit on existing meal, change quantity, verify update
3. **Inline Qty Edit**: Click food amount in list, edit, blur, verify saved
4. **Hero Visualizations**: Log meals, verify wheels and calorie bar update
5. **Target Editing**: Click calorie target, edit, verify saves to profile
6. **Collapsible Sections**: Expand/collapse meal types, verify state persistence
7. **Historical Log**: Expand history, view details for past day
8. **Copy Meal**: Copy a meal, verify new entry created
9. **Favorites**: Save meal as favorite, verify appears in favorites, quick-log it
10. **Recent Foods**: Log meals, verify recent foods appear in modal search

### Automated Tests

- `src/__tests__/components/meals/SegmentedCalorieBar.test.tsx` - 0%, 50%, 100%, 150% cases
- `src/__tests__/components/meals/MealTypeSection.test.tsx` - expand/collapse, actions
- `src/__tests__/api/meals/[id]/route.test.ts` - PUT validation

### Build Verification

```bash
npm run build && npm run lint && npm test
```
