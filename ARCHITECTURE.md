# Health Tracker 9000 - Architecture Guide

Quick reference for AI assistants and developers navigating the Health Tracker 9000 codebase. This document provides entry points, data flow patterns, and quick references for all major components.

---

## Table of Contents

1. [Quick Start Navigation](#quick-start-navigation)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Repository Quick Reference](#repository-quick-reference)
4. [API Routes Map](#api-routes-map)
5. [Page Components Directory](#page-components-directory)
6. [Key Utilities Reference](#key-utilities-reference)
7. [Claude Skills Guide](#claude-skills-guide)
8. [State Management (Zustand)](#state-management-zustand)
9. [Common Patterns](#common-patterns)
10. [Database & Data Files](#database--data-files)

---

## Quick Start Navigation

### By Feature: Where to Start Reading

#### 🏠 Dashboard

**Goal**: Understand the home page showing health score, nutrition, meals, supplements

- **Entry point**: `src/app/page.tsx` - Main dashboard page
- **Key components**:
  - `src/components/dashboard/HealthScoreCard.tsx` - Health score calculation
  - `src/components/dashboard/NutritionSummaryCard.tsx` - Daily nutrition totals
  - `src/components/dashboard/TodaysMeals.tsx` - Today's meal list
  - `src/components/dashboard/TodaysSupplements.tsx` - Supplement compliance
- **State**: `src/lib/store/healthStore.ts` - Dashboard data
- **Data source**: `src/lib/database/repositories/dailySummaryRepository.ts`

#### 🍽️ Meals & Food

**Goal**: Add meals, search foods, check allergens, view meal history

- **Entry point**: `src/app/meals/page.tsx` - Meal logging page
- **API route**: `src/app/api/meals/route.ts` - POST/GET meals
- **Data access**: `src/lib/database/repositories/mealLogRepository.ts`
- **Food search**: `src/app/api/foods/search/route.ts` (local) and `usda-search/route.ts` (USDA)
- **Food repo**: `src/lib/database/repositories/foodRepository.ts`
- **Safety**: `src/lib/utils/allergenChecker.ts` - Allergen detection before logging
- **Key actions**: `healthStore.addMeal()`, `healthStore.searchFoods()`, `healthStore.searchUSDAFoods()`

#### 💊 Supplements

**Goal**: Manage supplements, track daily compliance, monitor nutrient targets

- **Entry point**: `src/app/supplements/page.tsx` - Supplement management page
- **API routes**: `src/app/api/supplements/route.ts` - CRUD operations
- **Data access**: `src/lib/database/repositories/supplementRepository.ts`
- **Nutrient targets**: `src/app/api/supplements/targets/route.ts`
- **State**: `src/lib/store/supplementStore.ts` - Supplement data and actions
- **Key actions**: `supplementStore.createSupplement()`, `supplementStore.logSupplementTaken()`, `supplementStore.updateNutrientTarget()`

#### 👤 Profile

**Goal**: Edit user health profile, set nutritional targets, manage allergies

- **Entry point**: `src/app/profile/page.tsx` - User profile page
- **API route**: `src/app/api/profile/route.ts` - GET/PUT profile
- **Data access**: `src/lib/database/repositories/profileRepository.ts`
- **Calculations**: `src/lib/utils/nutritionalCalculator.ts` - BMR/TDEE calculations
- **Key actions**: `healthStore.updateProfile()`

#### 📊 Analytics

**Goal**: View historical trends, weekly/monthly analytics, health insights

- **Entry point**: `src/app/analytics/page.tsx` - Analytics dashboard
- **API route**: `src/app/api/analytics/weekly/route.ts`
- **Data access**: `src/lib/database/repositories/dailySummaryRepository.ts`
- **Visualizations**: Charts in analytics page component

#### 🔥 Calories

**Goal**: Track daily calorie goals, view streaks, log weight, analyze trends

- **Entry point**: `src/app/calories/page.tsx` - Calorie tracking dashboard
- **API routes**: `src/app/api/calorie-tracking/` - Full calorie API
  - Current goal: `current/route.ts`
  - Daily tracking: `today/route.ts`
  - Weekly progress: `weekly/route.ts`
  - Monthly data: `month/route.ts`
  - Streaks: `streaks/route.ts`
- **Data access**: `src/lib/database/repositories/calorieTrackerRepository.ts`, `calorieGoalRepository.ts`, `weightLogRepository.ts`
- **State**: `src/lib/store/calorieTrackerStore.ts`

#### ⚙️ Admin & Debug

**Goal**: Database seeding, profile reset, system administration

- **Entry point**: `src/app/admin/page.tsx` - Admin utilities
- **Database operations**: Use CLI commands `npm run seed`, `npm run db:backup`, `npm run db:restore`

---

## Data Flow Diagrams

### Main Data Flow: Component → API → Repository → Database

```
User Input (Form/Button Click)
    ↓
Page Component (src/app/*.tsx)
    ↓
Zustand Store Action (async action)
    ↓
API Route Handler (src/app/api/**/route.ts)
    ├─ Validation (Zod schemas)
    ├─ Authorization check
    └─ Repository method call
    ↓
Repository Class (src/lib/database/repositories/*.ts)
    ├─ Query builder
    ├─ Row mapping (snake_case ↔ camelCase)
    └─ JSON parsing/stringifying
    ↓
SQLite Database (better-sqlite3)
    ↓
API Response (JSON with HTTP status)
    ↓
Store updates state
    ↓
Component re-renders with new data
```

### Health Score Calculation Flow

```
Daily Summary Fetch
    ↓
Collect daily data:
├─ Meal logs (breakfast, lunch, dinner, snacks)
├─ Supplement compliance
├─ Hydration status
└─ Weight (if logged)
    ↓
Calculate components (src/lib/utils/healthScoring.ts):
├─ Macro balance score (40%)
├─ Micronutrient targets met (40%)
├─ Supplement compliance (10%)
└─ Hydration score (10%)
    ↓
Combined Health Score (0-100)
    ↓
Store in daily_summary table
    ↓
Dashboard displays score with breakdown
```

### Meal Logging with Allergen Safety

```
User enters meal with foods
    ↓
Form submission → API /meals/route.ts
    ↓
Allergen check (src/lib/utils/allergenChecker.ts):
├─ Load user's allergies from profile
├─ Check each food's allergens
└─ Flag conflicts if found
    ↓
If conflicts:
├─ Return error with specific conflicts
└─ User sees warning and can proceed/cancel
    ↓
If safe:
├─ Add meal_log entry
├─ Update daily_summary
├─ Fetch updated daily totals
└─ Return new state
    ↓
Store updates, dashboard reflects new meal
```

### Zustand Store → API → Repository Flow

```
Component calls store action:
    healthStore.addMeal(mealData)
    ↓
Zustand action:
├─ Set loading: true
├─ Call API route: POST /api/meals
└─ On response, update state
    ↓
API route (/api/meals/route.ts):
├─ Parse request body
├─ Validate with Zod schema
├─ Call repository method
├─ Catch errors, log, return response
└─ Return JSON with status code
    ↓
Repository (mealLogRepository.addMealLog):
├─ Map TypeScript object to snake_case
├─ Execute SQL INSERT
├─ Map result back to camelCase
└─ Return new meal object
    ↓
Store receives response:
├─ Update state.dailyLog
├─ Set loading: false
├─ Show success toast
└─ Trigger re-render
    ↓
Component displays updated data
```

---

## Repository Quick Reference

All database operations go through repository classes. Located in: `src/lib/database/repositories/`

### Meal Operations

**File**: `mealLogRepository.ts`

```
addMealLog(date: Date, mealType: string, foods: Food[]): MealLog
getMealLogsByDate(date: Date): MealLog[]
updateMealLog(id: string, updates: Partial<MealLog>): MealLog
deleteMealLog(id: string): void
getRecentFoods(limit: number): Food[]
```

### Food Management

**File**: `foodRepository.ts`

```
searchFoods(query: string, limit?: number): Food[]
getFoodById(id: string): Food | null
checkAllergens(foodId: string): string[] // allergen names
createFoodFromUSDA(usda: USDAFood): Food
getFoodByUSDAId(fdcId: string): Food | null
saveFoodAllergens(foodId: string, allergens: string[]): void
```

### Supplements & Nutrients

**File**: `supplementRepository.ts`

```
getAllSupplements(): Supplement[]
createSupplement(data: SupplementData): Supplement
updateSupplement(id: string, updates: Partial<Supplement>): Supplement
deleteSupplement(id: string): void
logSupplementTaken(supplementId: string, date: Date, taken: boolean): SupplementLog
getSupplementLogsByDate(date: Date): SupplementLog[]
upsertNutrientTarget(nutrientKey: NutrientKey, targetValue: number): NutrientTarget
createCustomNutrient(name: string, unit: string): CustomNutrient
```

### User Profile

**File**: `profileRepository.ts`

```
getProfile(): UserProfile
updateProfile(updates: Partial<UserProfile>): UserProfile
calculateNutritionalTargets(profile: UserProfile): NutritionalTargets
```

### Daily Aggregations

**File**: `dailySummaryRepository.ts`

```
getDailySummary(date: Date): DailyLog | null
calculateDailyTotals(date: Date): DailyTotals
saveDailySummary(date: Date, summary: DailyLog): void
getWeeklySummary(startDate: Date): WeeklySummary
getAllDailySummaries(limit?: number): DailyLog[]
```

### Calorie Tracking

**File**: `calorieTrackerRepository.ts`

```
updateDailyTracking(date: Date, consumed: number): DailyCalorieTracking
getDailyTracking(date: Date): DailyCalorieTracking | null
getWeeklyTracking(startDate: Date): WeeklyProgressData
getMonthlyTracking(date: Date): MonthlyCalorieData
getCurrentStreak(): CalorieStreak
getStreakInfo(): StreakInfo
```

**File**: `calorieGoalRepository.ts`

```
createGoal(goal: CalorieGoal): void
getCurrentGoal(): CalorieGoal | null
updateGoal(updates: Partial<CalorieGoal>): void
getGoalHistory(): CalorieGoalHistory[]
archiveCurrentGoal(): void
```

### Weight Tracking

**File**: `weightLogRepository.ts`

```
logWeight(weight: number, date?: Date, notes?: string): WeightLog
getWeightHistory(limit?: number): WeightLog[]
getLatestWeight(): WeightLog | null
getWeightForDate(date: Date): WeightLog | null
deleteWeightLog(id: string): void
```

### Favorites

**File**: `mealFavoritesRepository.ts`

```
addFavorite(mealData: MealLog): FavoriteMeal
getFavorites(): FavoriteMeal[]
getFavoriteById(id: string): FavoriteMeal | null
updateFavorite(id: string, updates: Partial<MealLog>): FavoriteMeal
deleteFavorite(id: string): void
```

---

## API Routes Map

All API routes in `src/app/api/` follow RESTful conventions. Organized by domain:

### Meals Domain (`/api/meals`)

```
POST   /meals              Add new meal log
GET    /meals              Get meal logs for date (query: ?date=YYYY-MM-DD)
GET    /meals/[id]         Get specific meal
PUT    /meals/[id]         Update meal
DELETE /meals/[id]         Delete meal

GET    /meals/favorites    Get favorite meals
POST   /meals/favorites    Save current meal as favorite
DELETE /meals/favorites/[id] Remove favorite
```

### Foods Domain (`/api/foods`)

```
GET    /foods/search       Search local food DB (query: ?q=search&limit=20)
GET    /foods/[id]         Get food by ID
GET    /foods/recent       Get recently logged foods

GET    /foods/usda-search  Search USDA database (query: ?q=query&pageSize=20)
GET    /foods/usda/[fdcId] Get USDA food by FDC ID
POST   /foods/import       Import USDA food to local database

POST   /foods/import-all   Bulk import USDA foods
```

### Supplements Domain (`/api/supplements`)

```
GET    /supplements                Get all user supplements
POST   /supplements                Create new supplement
PUT    /supplements/[id]           Update supplement
DELETE /supplements/[id]           Delete supplement

POST   /supplements/logs           Log supplement taken/not taken
GET    /supplements/logs           Get supplement logs for date
PUT    /supplements/logs/[id]      Update supplement log
DELETE /supplements/logs/[id]      Delete supplement log

GET    /supplements/targets        Get nutrient targets
POST   /supplements/targets        Create/update nutrient target
PUT    /supplements/targets/[key]  Update specific target

POST   /supplements/custom-nutrients  Create custom nutrient
```

### Calorie Tracking Domain (`/api/calorie-tracking`)

```
GET    /calorie-tracking/current       Get current goal
POST   /calorie-tracking               Create new goal
PUT    /calorie-tracking               Update current goal (e.g., change target)
DELETE /calorie-tracking               Archive current goal

GET    /calorie-tracking/today         Get today's calorie tracking
GET    /calorie-tracking/daily         Get specific day's tracking (query: ?date=)
POST   /calorie-tracking/daily         Log daily calories

GET    /calorie-tracking/weekly        Get weekly progress data
GET    /calorie-tracking/month         Get monthly breakdown
GET    /calorie-tracking/history       Get historical data (query: ?limit=)

GET    /calorie-tracking/streaks       Get streak information
PUT    /calorie-tracking/goal-change   Update goal with notification
```

### Weight Tracking Domain (`/api/weight-logs`)

```
POST   /weight-logs          Log weight entry
GET    /weight-logs          Get weight logs (query: ?limit=30)
GET    /weight-logs/latest   Get most recent weight
DELETE /weight-logs/[id]     Delete weight log
```

### Health & Analytics Domain

```
GET    /profile                     Get user profile
PUT    /profile                     Update user profile
DELETE /profile                     Reset profile (debug only)

GET    /daily-summary/[date]        Get daily summary for date
GET    /analytics/weekly            Get weekly analytics
```

### Data Management Domain

```
POST   /export                  Export all health data to JSON
POST   /import                  Import health data from JSON

GET    /debug/reset-profile    Reset profile to defaults (debug)
```

---

## Page Components Directory

Main user-facing pages in `src/app/`

| Route               | File                        | Purpose                                                                            |
| ------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| `/`                 | `page.tsx`                  | Dashboard: health score, nutrition summary, today's meals/supplements, trends      |
| `/meals`            | `meals/page.tsx`            | Meal logging: add meals, search foods, check allergens, view recent meals          |
| `/supplements`      | `supplements/page.tsx`      | Supplement management: add/edit supplements, daily compliance, nutrient targets    |
| `/profile`          | `profile/page.tsx`          | User profile: age, weight, height, activity level, health conditions, allergies    |
| `/analytics`        | `analytics/page.tsx`        | Analytics dashboard: weekly/monthly trends, health score chart, nutrition analysis |
| `/history`          | `history/page.tsx`          | Historical data: past meals, supplement logs, daily summaries                      |
| `/calories`         | `calories/page.tsx`         | Calorie tracking: goals, daily tracking, streaks, weight logs, trends              |
| `/admin`            | `admin/page.tsx`            | Admin utilities: seed database, reset profile, export/import data                  |
| `/toxicity-demo`    | `toxicity-demo/page.tsx`    | Demo page: supplement toxicity threshold visualization                             |
| `/test-food-search` | `test-food-search/page.tsx` | Test page: USDA food search integration testing                                    |

---

## Key Utilities Reference

All business logic helpers in `src/lib/utils/`

### Health Scoring

**File**: `healthScoring.ts`

```typescript
calculateHealthScore(dailyLog: DailyLog, profile: UserProfile): number

// Calculation breakdown:
// - Macro balance (40%): protein/carb/fat ratios vs targets
// - Micronutrient coverage (40%): vitamins/minerals vs targets
// - Supplement compliance (10%): % of supplements taken
// - Hydration (10%): 8+ glasses logged
// Result: 0-100 score
```

### Nutritional Calculations

**File**: `nutrition.ts`

```typescript
calculateNutrition(foods: Food[]): NutrientTotals
sumNutrition(meals: MealLog[]): NutrientTotals

// Returns totals for:
// - Macros: calories, protein, carbs, fat
// - Micros: all vitamins and minerals
// - Fiber, sodium, etc.
```

**File**: `nutritionalCalculator.ts`

```typescript
calculateBMR(profile: UserProfile): number           // Basal metabolic rate
calculateTDEE(bmr: number, activityLevel: string): number  // Daily energy expenditure
calculateNutritionalTargets(profile: UserProfile): NutritionalTargets
  // Returns daily targets for all nutrients based on profile
```

### Allergen Safety

**File**: `allergenChecker.ts`

```typescript
checkFoodForAllergens(food: Food, userAllergies: string[]): string[]
  // Returns list of matching allergens

flagConflicts(foods: Food[], userAllergies: string[]): AllergenConflict[]
  // Returns structured conflicts with food names and allergens
  // Use before allowing meal submission
```

### Recommendations

**File**: `recommendations.ts`

```typescript
generateRecommendations(profile: UserProfile, dailyLog: DailyLog): Recommendation[]

// Generates personalized recommendations for:
// - Macro deficiencies (protein, carbs, fat)
// - Micro deficiencies (specific vitamins/minerals)
// - Supplement reminders
// - Gout-specific food warnings
// - Activity level adjustments
```

### Data Validation

**File**: `importValidation.ts`

```typescript
validateImportData(data: unknown): ImportValidationResult
  // Validates structure and schema of imported health data
  // Checks version compatibility
  // Returns errors list if validation fails
```

### Mock Data

**File**: `mockProfileData.ts`

```typescript
// Default profile for seeding database
// Includes sample user profile, targets, and seed foods
```

---

## Claude Skills Guide

Seven AI skills available in `.claude/skills/` for code generation:

### 1. add-feature

**When to use**: Adding a major new feature end-to-end
**Generates**:

- TypeScript types/interfaces
- Repository class with CRUD methods
- API routes with validation
- React components
- Zustand store actions
- Jest test suite

**Example**: `@add-feature Add water intake tracking`

### 2. generate-api-route

**When to use**: Creating new API endpoints
**Generates**:

- Next.js API route handler
- Zod validation schema
- Repository method calls
- Error handling
- HTTP status codes

**Example**: `@generate-api-route Create GET endpoint for weekly health summary`

### 3. generate-repository

**When to use**: Creating database access layer for new feature
**Generates**:

- Repository class
- CRUD methods (Create, Read, Update, Delete)
- Row mapping (snake_case ↔ camelCase)
- Type definitions
- SQL queries with better-sqlite3

**Example**: `@generate-repository Create meal favorites repository`

### 4. generate-card

**When to use**: Creating new dashboard widgets/stat cards
**Generates**:

- React component with shadcn/ui Card
- TypeScript props interface
- Optional sub-components
- Tailwind styling
- Data display logic

**Example**: `@generate-card Create weekly protein intake card`

### 5. generate-form

**When to use**: Creating data entry forms with validation
**Generates**:

- React form component
- Zod validation schema
- Controlled input components
- Submit handling
- Error messages
- Loading states

**Example**: `@generate-form Create supplement dosage frequency form`

### 6. generate-store-action

**When to use**: Adding new data fetching/mutation actions to Zustand store
**Generates**:

- Async Zustand action
- Loading/error state handling
- API call integration
- Toast notifications for success/error
- State update logic

**Example**: `@generate-store-action Add exportHealthData action to healthStore`

### 7. generate-test

**When to use**: Creating test coverage for components, repos, APIs
**Generates**:

- Jest test suite
- Mock objects and fixtures
- Common test cases (happy path, errors, edge cases)
- React Testing Library component tests
- Setup and teardown

**Example**: `@generate-test Create tests for mealLogRepository`

---

## State Management (Zustand)

Three global state stores manage application state. Located in: `src/lib/store/`

### Health Store

**File**: `healthStore.ts` - Main health data and meal management

```typescript
State:
  profile: UserProfile | null
  dailyLog: DailyLog | null
  weeklySummary: WeeklySummary | null
  allSupplements: Supplement[]
  loading: boolean
  error: string | null

Actions:
  // Profile
  fetchProfile(): Promise<void>
  updateProfile(updates: Partial<UserProfile>): Promise<void>

  // Daily data
  fetchDailyLog(date: Date): Promise<void>
  fetchWeeklySummary(startDate: Date): Promise<void>

  // Meals
  addMeal(date: Date, mealType: string, foods: Food[]): Promise<void>
  deleteMeal(mealId: string): Promise<void>

  // Food search
  searchFoods(query: string): Promise<Food[]>
  searchUSDAFoods(query: string): Promise<USDAFood[]>
  importUSDAFood(foodData: USDAFood): Promise<void>

  // Supplements
  toggleSupplement(supplementId: string, date: Date, taken: boolean): Promise<void>
```

### Supplement Store

**File**: `supplementStore.ts` - Supplement and nutrient tracking

```typescript
State:
  supplements: Supplement[]
  todayLogs: SupplementLog[]
  nutrientTargets: Record<NutrientKey, number>
  customNutrientMetadata: CustomNutrientMetadata[]
  loading: boolean
  error: string | null

Actions:
  // Supplement CRUD
  fetchSupplements(): Promise<void>
  createSupplement(data: SupplementFormData): Promise<void>
  updateSupplement(id: string, updates: Partial<Supplement>): Promise<void>
  deleteSupplement(id: string): Promise<void>

  // Daily logging
  logSupplementTaken(supplementId: string, date: Date, taken: boolean): Promise<void>
  updateLog(logId: string, updates: Partial<SupplementLog>): Promise<void>
  deleteLog(logId: string): Promise<void>

  // Nutrient targets
  fetchNutrientTargets(): Promise<void>
  updateNutrientTarget(nutrientKey: NutrientKey, value: number): Promise<void>

  // Custom nutrients
  fetchCustomNutrients(): Promise<void>
  createCustomNutrient(name: string, unit: string): Promise<void>

Computed:
  calculateNutrientProgress(): NutrientProgress
  calculateCustomNutrientProgress(): CustomNutrientProgress
  getNutrientSupplements(): Supplement[]
  getCustomSupplements(): Supplement[]
```

### Calorie Tracker Store

**File**: `calorieTrackerStore.ts` - Calorie goal and progress tracking

```typescript
State:
  currentGoal: CalorieGoal | null
  todayTracking: DailyCalorieTracking | null
  weeklyTracking: WeeklyProgressData | null
  monthlyData: MonthlyCalorieData | null
  streakInfo: StreakInfo | null
  goalHistory: CalorieGoalHistory[]
  loading: boolean
  error: string | null
  onboardingDismissed: boolean

Actions:
  // Goal management
  fetchCurrentGoal(): Promise<void>
  createGoal(goal: CalorieGoal): Promise<void>
  updateGoal(updates: Partial<CalorieGoal>): Promise<void>
  fetchGoalHistory(): Promise<void>

  // Daily tracking
  fetchDailyTracking(date?: Date): Promise<void>

  // Analytics
  fetchWeeklyTracking(startDate: Date): Promise<void>
  fetchMonthlyData(date: Date): Promise<void>
  fetchStreakData(): Promise<void>

  // UI state
  dismissOnboarding(): void
```

---

## Common Patterns

### Repository Pattern (All DB Access)

```typescript
// In repository class
export class MealLogRepository {
  addMealLog(mealData: MealLog): MealLog {
    // Map camelCase → snake_case for DB
    const row = {
      id: crypto.randomUUID(),
      user_id: 'default',
      meal_date: mealData.date,
      meal_type: mealData.type,
      foods: JSON.stringify(mealData.foods),
      created_at: new Date(),
    };

    // Execute query
    const stmt = db.prepare(`INSERT INTO meal_logs (...) VALUES (...)`);
    stmt.run(...Object.values(row));

    // Map snake_case → camelCase for return
    return mapRowToMealLog(row);
  }
}

// In API route
export async function POST(request: Request) {
  const data = await request.json();
  const validated = mealLogSchema.parse(data); // Zod validation

  const repo = new MealLogRepository();
  const result = await repo.addMealLog(validated);

  return Response.json(result, { status: 201 });
}

// In Zustand action
const addMeal = async (mealData) => {
  set({ loading: true });
  try {
    const res = await fetch('/api/meals', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
    const result = await res.json();
    set((state) => ({
      dailyLog: { ...state.dailyLog, meals: [...state.dailyLog.meals, result] },
    }));
  } catch (error) {
    set({ error: error.message });
  } finally {
    set({ loading: false });
  }
};
```

### Form with Validation

```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Define schema
const mealSchema = z.object({
  date: z.coerce.date(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foods: z.array(z.string()).min(1, 'Add at least one food'),
})

// Use in component
export function MealForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(mealSchema),
  })

  const onSubmit = async (data) => {
    await healthStore.addMeal(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('date')} type="date" />
      {errors.date && <span>{errors.date.message}</span>}
      {/* other fields */}
    </form>
  )
}
```

### Async Zustand Action with Loading/Error

```typescript
const healthStore = create((set) => ({
  dailyLog: null,
  loading: false,
  error: null,

  fetchDailyLog: async (date) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/daily-summary/${formatDate(date)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      set({ dailyLog: data });
      toast.success('Daily data loaded');
    } catch (error) {
      set({ error: error.message });
      toast.error(`Error: ${error.message}`);
    } finally {
      set({ loading: false });
    }
  },
}));
```

### Row Mapping (snake_case ↔ camelCase)

```typescript
// Database returns snake_case rows
const row = {
  id: '123',
  user_id: 'default',
  meal_date: '2025-01-21',
  meal_type: 'breakfast',
  foods: '[{"id":"1","name":"eggs"}]',
  created_at: '2025-01-21T10:00:00',
};

// Map to TypeScript camelCase
function mapRowToMealLog(row): MealLog {
  return {
    id: row.id,
    userId: row.user_id,
    date: new Date(row.meal_date),
    type: row.meal_type,
    foods: JSON.parse(row.foods),
    createdAt: new Date(row.created_at),
  };
}
```

### Error Handling in API Routes

```typescript
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validation
    const validated = schema.parse(data);

    // Business logic
    const repo = new MyRepository();
    const result = await repo.create(validated);

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }

    console.error('API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Database & Data Files

### SQLite Database

- **Location**: `data/health.db` (created on first run)
- **Schema**: `src/lib/database/schema.sql` - Table definitions
- **Migrations**: `src/lib/database/migrations/` - Schema updates
- **Connection**: `src/lib/database/connection.ts` - better-sqlite3 setup

### Mock Data

- **Profile**: `data/mock-profile.json` - Sample user profile
- **Foods**: `data/mock-foods.json` - Sample food database
- **Supplements**: `data/mock-supplements.json` - Sample supplements
- **Seeding**: `src/lib/database/seed.ts` - Loads mock data

### Database Operations

```bash
# Development
npm run dev              # Starts server with SQLite DB

# Database management
npm run seed             # Seed DB with mock data
npm run db:backup        # Create timestamped backup file
npm run db:restore [file] # Restore from backup

# Code quality
npm test                 # Run Jest tests
npm run lint             # Run ESLint
npm run build            # Production build
```

### Database Tables

- **profile** - User health profile (age, weight, height, conditions, allergies)
- **nutritional_targets** - Daily/weekly nutrient goals
- **foods** - Food database with nutrition per 100g and allergens
- **supplements** - User's supplement list
- **supplement_targets** - Nutrient targets for tracking
- **meal_logs** - Daily meal entries (foods stored as JSON)
- **supplement_logs** - Daily supplement compliance
- **daily_summary** - Aggregated daily health data and score
- **calorie_goals** - User's calorie goals history
- **calorie_tracking** - Daily calorie consumption and tracking
- **weight_logs** - Weight history entries
- **meal_favorites** - Saved favorite meals

---

## Quick Reference: Key File Paths

```
src/
├── app/
│   ├── page.tsx                           # Dashboard
│   ├── meals/page.tsx                     # Meal logging
│   ├── supplements/page.tsx               # Supplement management
│   ├── profile/page.tsx                   # Profile editing
│   ├── analytics/page.tsx                 # Analytics
│   ├── calories/page.tsx                  # Calorie tracking
│   ├── api/
│   │   ├── meals/route.ts                 # Meal CRUD
│   │   ├── foods/search/route.ts          # Food search
│   │   ├── supplements/route.ts           # Supplement CRUD
│   │   ├── calorie-tracking/             # Calorie endpoints
│   │   ├── weight-logs/route.ts           # Weight CRUD
│   │   ├── profile/route.ts               # Profile API
│   │   └── daily-summary/[date]/route.ts  # Daily summaries
│   └── layout.tsx                         # Root layout
│
├── components/
│   ├── dashboard/
│   │   ├── HealthScoreCard.tsx
│   │   ├── NutritionSummaryCard.tsx
│   │   ├── MacroChart.tsx
│   │   └── TodaysMeals.tsx
│   ├── forms/
│   │   ├── MealLogForm.tsx
│   │   └── ProfileForm.tsx
│   ├── layout/
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/                                # shadcn/ui base components
│
├── lib/
│   ├── database/
│   │   ├── connection.ts
│   │   ├── schema.sql
│   │   ├── seed.ts
│   │   └── repositories/
│   │       ├── mealLogRepository.ts
│   │       ├── foodRepository.ts
│   │       ├── supplementRepository.ts
│   │       ├── profileRepository.ts
│   │       ├── dailySummaryRepository.ts
│   │       ├── mealFavoritesRepository.ts
│   │       ├── calorieTrackerRepository.ts
│   │       ├── calorieGoalRepository.ts
│   │       └── weightLogRepository.ts
│   ├── store/
│   │   ├── healthStore.ts
│   │   ├── supplementStore.ts
│   │   └── calorieTrackerStore.ts
│   ├── utils/
│   │   ├── healthScoring.ts
│   │   ├── nutrition.ts
│   │   ├── nutritionalCalculator.ts
│   │   ├── allergenChecker.ts
│   │   ├── recommendations.ts
│   │   └── importValidation.ts
│   ├── types/
│   │   ├── health.ts
│   │   ├── supplements.ts
│   │   ├── calorieTracking.ts
│   │   ├── weight.ts
│   │   └── export.ts
│   └── constants/
│       └── nutrients.ts
│
├── hooks/                                  # Custom React hooks
├── data/
│   ├── health.db                          # SQLite database (gitignored)
│   ├── mock-profile.json
│   ├── mock-foods.json
│   └── mock-supplements.json
│
└── __tests__/                             # Jest test files
    └── (mirrors src/ structure)

.claude/
└── skills/                                # Claude AI skills
    ├── add-feature/
    ├── generate-api-route/
    ├── generate-card/
    ├── generate-form/
    ├── generate-repository/
    ├── generate-store-action/
    └── generate-test/

docs/
├── API.md                                 # API endpoint documentation
├── roadmap.md                             # Project phases and status
└── reference.md                           # Development conventions
```

---

## Getting Started for AI Assistants

1. **Need to understand a feature?** → Start with Quick Start Navigation above
2. **Want to see how data flows?** → Check Data Flow Diagrams
3. **Building a new API endpoint?** → Look at API Routes Map + generate-api-route skill
4. **Adding database operations?** → Repository Quick Reference + generate-repository skill
5. **Creating a dashboard widget?** → generate-card skill
6. **Need to add state management?** → State Management section + generate-store-action skill
7. **Building forms?** → generate-form skill
8. **Understand patterns?** → Common Patterns section

---

**Last Updated**: 2026-01-21
**Project Status**: Phase 9 - MVP Launch
**For detailed info**: See `CLAUDE.md`, `README.md`, `DEVELOPMENT.md`
