# Health Tracker 9000 - Development TODO List

## Phase 0: Project Setup & Configuration

### 0.1 Initialize Project

- [x] Create project directory: `health-tracker-9000`
- [x] Run `npx create-next-app@latest health-tracker-9000 --typescript --tailwind --eslint --app --src-dir`
- [x] Select options:
  - TypeScript: Yes
  - ESLint: Yes
  - Tailwind CSS: Yes
  - `src/` directory: Yes
  - App Router: Yes
  - Customize default import alias: No (keep @/\*)

### 0.2 Git Setup

- [x] Initialize git: `git init`
- [x] Create `.gitignore` and ensure it includes:

  ```
  # dependencies
  node_modules/

  # next.js
  .next/
  out/
  build/

  # local data (IMPORTANT - keep health data private)
  /data/
  *.db
  *.sqlite
  *.sqlite3

  # env files
  .env*.local

  # debug
  npm-debug.log*
  yarn-debug.log*

  # IDE
  .vscode/
  .idea/
  ```

- [x] Create `.gitattributes` for consistent line endings
- [x] Initial commit: `git add . && git commit -m "feat: initial Next.js setup with TypeScript and Tailwind"`

### 0.3 Code Quality Tools Setup

- [x] Install Prettier: `npm install -D prettier eslint-config-prettier eslint-plugin-prettier`
- [x] Create `.prettierrc.json`:
  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false
  }
  ```
- [x] Create `.prettierignore`:
  ```
  .next
  node_modules
  out
  build
  *.db
  ```
- [x] Update `.eslintrc.json` (integrated into `eslint.config.mjs`) to extend prettier:
  ```json
  {
    "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"],
    "rules": {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
  ```

### 0.4 Husky & Git Hooks Setup

- [x] Install husky and lint-staged: `npm install -D husky lint-staged`
- [x] Initialize husky: `npx husky init`
- [x] Create `.husky/pre-commit`:

  ```bash
  #!/usr/bin/env sh
  . "$(dirname -- "$0")/_/husky.sh"

  npx lint-staged
  ```

- [x] Add to `package.json`:
  ```json
  {
    "lint-staged": {
      "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
      "*.{json,md,css}": ["prettier --write"]
    }
  }
  ```
- [x] Test pre-commit hook with a dummy change
- [x] Commit: `git commit -m "chore: configure Prettier, ESLint, and Husky pre-commit hooks"`

### 0.5 TypeScript Configuration Enhancement

- [x] Update `tsconfig.json` for strict type checking:
- [x] Commit: `git commit -m "chore: enhance TypeScript strict mode configuration"`

### 0.6 Install Core Dependencies

- [ ] Install production dependencies:
  ```bash
  npm install better-sqlite3 @types/better-sqlite3 recharts date-fns zustand zod
  ```
- [ ] Install shadcn/ui CLI: `npx shadcn@latest init`
  - Choose defaults for shadcn config
- [ ] Install initial shadcn components:
  ```bash
  npx shadcn@latest add button card input label select table tabs
  ```
- [ ] Commit: `git commit -m "chore: install core dependencies and shadcn/ui components"`

### 0.7 Project Structure Setup

- [ ] Create directory structure:

  ```
  src/
  ├── app/
  ├── components/
  │   ├── dashboard/
  │   ├── forms/
  │   ├── layout/
  │   └── ui/ (shadcn)
  ├── lib/
  │   ├── database/
  │   ├── types/
  │   └── utils/
  ├── hooks/
  └── constants/

  /data/ (create but gitignore)
  ├── mock-profile.json
  └── mock-foods.json
  ```

- [ ] Create `/data` directory in project root
- [ ] Commit: `git commit -m "chore: establish project directory structure"`

### 0.8 Documentation Setup

- [ ] Create `README.md` with:
  - Project overview
  - Setup instructions
  - Development commands
  - Architecture overview
- [ ] Create `DEVELOPMENT.md` with:
  - Development workflow
  - Git commit conventions
  - Code style guide
- [ ] Commit: `git commit -m "docs: add README and development documentation"`

---

## Phase 1: Database Schema & Mock Data Setup

### 1.1 Define TypeScript Types

- [ ] Create `src/lib/types/health.ts`:

  ```typescript
  export interface UserProfile {
    id: string;
    age: number;
    weight: number; // kg
    height: number; // cm
    gender: 'male' | 'female' | 'other';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    healthConditions: string[]; // e.g., ['gout']
    allergies: string[]; // e.g., ['shellfish', 'peanuts']
    createdAt: string;
    updatedAt: string;
  }

  export interface NutritionalTargets {
    calories: number;
    protein: number; // grams
    carbs: number;
    fat: number;
    fiber: number;
    // Vitamins (mg or mcg)
    vitaminA: number;
    vitaminC: number;
    vitaminD: number;
    vitaminE: number;
    vitaminK: number;
    // B vitamins
    thiamin: number;
    riboflavin: number;
    niacin: number;
    vitaminB6: number;
    folate: number;
    vitaminB12: number;
    // Minerals (mg or mcg)
    calcium: number;
    iron: number;
    magnesium: number;
    potassium: number;
    zinc: number;
    selenium: number;
  }

  export interface Food {
    id: string;
    name: string;
    servingSize: number; // grams
    servingUnit: string;
    nutritionPer100g: NutritionalValues;
  }

  export interface NutritionalValues {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    // All vitamins and minerals same as targets
    [key: string]: number;
  }

  export interface Supplement {
    id: string;
    name: string;
    brand: string;
    nutrients: Partial<NutritionalValues>;
    servingSize: string;
    notes?: string;
  }

  export interface MealLog {
    id: string;
    date: string; // ISO date
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: Array<{
      foodId: string;
      foodName: string;
      amount: number; // grams
    }>;
    totalNutrition: NutritionalValues;
    createdAt: string;
  }

  export interface SupplementLog {
    id: string;
    date: string;
    supplementId: string;
    supplementName: string;
    taken: boolean;
    createdAt: string;
  }

  export interface DailyLog {
    date: string;
    weight?: number;
    meals: MealLog[];
    supplements: SupplementLog[];
    totalNutrition: NutritionalValues;
    healthScore: number;
    notes?: string;
  }
  ```

- [ ] Commit: `git commit -m "feat: define core TypeScript types for health data"`

### 1.2 Create Database Schema

- [ ] Create `src/lib/database/schema.sql`:

  ```sql
  -- User Profile
  CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY,
    age INTEGER NOT NULL,
    weight REAL NOT NULL,
    height REAL NOT NULL,
    gender TEXT NOT NULL,
    activity_level TEXT NOT NULL,
    health_conditions TEXT, -- JSON array
    allergies TEXT, -- JSON array
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- Nutritional Targets
  CREATE TABLE IF NOT EXISTS nutritional_targets (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    calories REAL NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    fiber REAL NOT NULL,
    vitamin_a REAL,
    vitamin_c REAL,
    vitamin_d REAL,
    vitamin_e REAL,
    vitamin_k REAL,
    thiamin REAL,
    riboflavin REAL,
    niacin REAL,
    vitamin_b6 REAL,
    folate REAL,
    vitamin_b12 REAL,
    calcium REAL,
    iron REAL,
    magnesium REAL,
    potassium REAL,
    zinc REAL,
    selenium REAL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  -- Foods Database
  CREATE TABLE IF NOT EXISTS foods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    serving_size REAL NOT NULL,
    serving_unit TEXT NOT NULL,
    calories REAL NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    fiber REAL,
    -- Add all other nutrients as columns
    allergens TEXT, -- JSON array
    created_at TEXT NOT NULL
  );

  -- User's Supplements
  CREATE TABLE IF NOT EXISTS supplements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    serving_size TEXT NOT NULL,
    nutrients TEXT NOT NULL, -- JSON
    notes TEXT,
    created_at TEXT NOT NULL
  );

  -- Daily Meal Logs
  CREATE TABLE IF NOT EXISTS meal_logs (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    foods TEXT NOT NULL, -- JSON array
    total_nutrition TEXT NOT NULL, -- JSON
    created_at TEXT NOT NULL
  );

  -- Daily Supplement Logs
  CREATE TABLE IF NOT EXISTS supplement_logs (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    supplement_id TEXT NOT NULL,
    supplement_name TEXT NOT NULL,
    taken INTEGER NOT NULL, -- boolean as 0/1
    created_at TEXT NOT NULL,
    FOREIGN KEY (supplement_id) REFERENCES supplements(id)
  );

  -- Daily Summary
  CREATE TABLE IF NOT EXISTS daily_summary (
    date TEXT PRIMARY KEY,
    weight REAL,
    total_nutrition TEXT NOT NULL, -- JSON
    health_score REAL NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_meal_logs_date ON meal_logs(date);
  CREATE INDEX IF NOT EXISTS idx_supplement_logs_date ON supplement_logs(date);
  CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
  ```

- [ ] Commit: `git commit -m "feat: create SQLite database schema"`

### 1.3 Database Connection Module

- [ ] Create `src/lib/database/connection.ts`:

  ```typescript
  import Database from 'better-sqlite3';
  import path from 'path';
  import fs from 'fs';

  const DB_PATH = path.join(process.cwd(), 'data', 'health.db');
  const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');

  let db: Database.Database | null = null;

  export function getDatabase(): Database.Database {
    if (db) return db;

    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create/open database
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    // Initialize schema if database is new
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);

    return db;
  }

  export function closeDatabase(): void {
    if (db) {
      db.close();
      db = null;
    }
  }
  ```

- [ ] Commit: `git commit -m "feat: implement database connection module with initialization"`

### 1.4 Create Mock Data

- [ ] Create `data/mock-profile.json`:
  ```json
  {
    "id": "user-001",
    "age": 40,
    "weight": 82,
    "height": 178,
    "gender": "male",
    "activityLevel": "moderate",
    "healthConditions": ["gout"],
    "allergies": ["shellfish", "tree nuts"],
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-17T00:00:00Z"
  }
  ```
- [ ] Create `data/mock-foods.json` with 20-30 common foods:
  ```json
  [
    {
      "id": "food-001",
      "name": "Chicken Breast (grilled)",
      "servingSize": 100,
      "servingUnit": "g",
      "nutritionPer100g": {
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "fiber": 0
      },
      "allergens": []
    }
    // ... add more foods
  ]
  ```
- [ ] Create `data/mock-supplements.json`:
  ```json
  [
    {
      "id": "supp-001",
      "name": "Sentry Men's Multivitamin",
      "brand": "Care One",
      "servingSize": "1 tablet",
      "nutrients": {
        "vitaminA": 1050,
        "vitaminC": 90,
        "vitaminD": 25,
        "vitaminE": 20.3
      }
    }
  ]
  ```
- [ ] Commit: `git commit -m "feat: add mock profile, foods, and supplements data"`

### 1.5 Data Seeding Script

- [ ] Create `src/lib/database/seed.ts`:

  ```typescript
  import { getDatabase } from './connection';
  import fs from 'fs';
  import path from 'path';

  export function seedDatabase() {
    const db = getDatabase();

    // Read mock data
    const profileData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'data', 'mock-profile.json'), 'utf-8')
    );
    const foodsData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'data', 'mock-foods.json'), 'utf-8')
    );
    const supplementsData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'data', 'mock-supplements.json'), 'utf-8')
    );

    // Insert profile
    const insertProfile = db.prepare(`
      INSERT OR REPLACE INTO profile 
      (id, age, weight, height, gender, activity_level, health_conditions, allergies, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProfile.run(
      profileData.id,
      profileData.age,
      profileData.weight,
      profileData.height,
      profileData.gender,
      profileData.activityLevel,
      JSON.stringify(profileData.healthConditions),
      JSON.stringify(profileData.allergies),
      profileData.createdAt,
      profileData.updatedAt
    );

    // Insert foods
    const insertFood = db.prepare(`
      INSERT OR REPLACE INTO foods 
      (id, name, serving_size, serving_unit, calories, protein, carbs, fat, fiber, allergens, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    foodsData.forEach((food: any) => {
      insertFood.run(
        food.id,
        food.name,
        food.servingSize,
        food.servingUnit,
        food.nutritionPer100g.calories,
        food.nutritionPer100g.protein,
        food.nutritionPer100g.carbs,
        food.nutritionPer100g.fat,
        food.nutritionPer100g.fiber || 0,
        JSON.stringify(food.allergens || []),
        new Date().toISOString()
      );
    });

    // Insert supplements
    const insertSupplement = db.prepare(`
      INSERT OR REPLACE INTO supplements 
      (id, name, brand, serving_size, nutrients, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    supplementsData.forEach((supp: any) => {
      insertSupplement.run(
        supp.id,
        supp.name,
        supp.brand,
        supp.servingSize,
        JSON.stringify(supp.nutrients),
        supp.notes || null,
        new Date().toISOString()
      );
    });

    console.log('✅ Database seeded successfully');
  }
  ```

- [ ] Add seed script to `package.json`:
  ```json
  {
    "scripts": {
      "seed": "tsx src/lib/database/seed.ts"
    }
  }
  ```
- [ ] Install tsx: `npm install -D tsx`
- [ ] Run seed: `npm run seed`
- [ ] Commit: `git commit -m "feat: implement database seeding with mock data"`

---

## Phase 2: Core Database Operations (Repository Pattern)

### 2.1 Profile Repository

- [ ] Create `src/lib/database/repositories/profileRepository.ts`:

  ```typescript
  import { getDatabase } from '../connection';
  import type { UserProfile, NutritionalTargets } from '@/lib/types/health';

  export class ProfileRepository {
    private db = getDatabase();

    getProfile(): UserProfile | null {
      const stmt = this.db.prepare('SELECT * FROM profile LIMIT 1');
      const row = stmt.get() as any;

      if (!row) return null;

      return {
        id: row.id,
        age: row.age,
        weight: row.weight,
        height: row.height,
        gender: row.gender,
        activityLevel: row.activity_level,
        healthConditions: JSON.parse(row.health_conditions || '[]'),
        allergies: JSON.parse(row.allergies || '[]'),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }

    updateProfile(profile: Partial<UserProfile>): void {
      // Implementation
    }

    calculateNutritionalTargets(): NutritionalTargets {
      // Implementation based on Harris-Benedict equation
    }
  }
  ```

- [ ] Commit: `git commit -m "feat: implement profile repository with CRUD operations"`

### 2.2 Food Repository

- [ ] Create `src/lib/database/repositories/foodRepository.ts`
- [ ] Implement: `searchFoods()`, `getFoodById()`, `checkAllergens()`
- [ ] Commit: `git commit -m "feat: implement food repository with search and allergen checking"`

### 2.3 Meal Log Repository

- [ ] Create `src/lib/database/repositories/mealLogRepository.ts`
- [ ] Implement: `addMealLog()`, `getMealLogsByDate()`, `updateMealLog()`, `deleteMealLog()`
- [ ] Commit: `git commit -m "feat: implement meal log repository"`

### 2.4 Supplement Repository

- [ ] Create `src/lib/database/repositories/supplementRepository.ts`
- [ ] Implement: `getAllSupplements()`, `logSupplementTaken()`, `getSupplementLogsByDate()`
- [ ] Commit: `git commit -m "feat: implement supplement repository"`

### 2.5 Daily Summary Repository

- [ ] Create `src/lib/database/repositories/dailySummaryRepository.ts`
- [ ] Implement: `getDailySummary()`, `calculateDailyTotals()`, `getWeeklySummary()`
- [ ] Commit: `git commit -m "feat: implement daily summary repository with aggregation"`

---

## Phase 3: Business Logic & Scoring

### 3.1 Nutritional Calculator

- [ ] Create `src/lib/utils/nutritionalCalculator.ts`
- [ ] Implement: `calculateBMR()`, `calculateTDEE()`, `calculateMacroTargets()`
- [ ] Commit: `git commit -m "feat: implement nutritional calculation utilities"`

### 3.2 Health Scoring Algorithm

- [ ] Create `src/lib/utils/healthScoring.ts`
- [ ] Implement scoring based on:
  - Macro adherence (40% weight)
  - Micronutrient adherence (40% weight)
  - Supplement compliance (10% weight)
  - Hydration/notes (10% weight)
- [ ] Return score 0-100 with breakdown
- [ ] Commit: `git commit -m "feat: implement health scoring algorithm"`

### 3.3 Recommendation Engine

- [ ] Create `src/lib/utils/recommendations.ts`
- [ ] Implement: `analyzeNutritionalGaps()`, `generateRecommendations()`
- [ ] Consider gout-specific recommendations (low purine, vitamin C, hydration)
- [ ] Commit: `git commit -m "feat: implement recommendation engine with gout considerations"`

### 3.4 Allergen Checker

- [ ] Create `src/lib/utils/allergenChecker.ts`
- [ ] Implement: `checkFoodForAllergens()`, `flagConflicts()`
- [ ] Commit: `git commit -m "feat: implement allergen checking utility"`

---

## Phase 4: UI Components (shadcn + Custom)

### 4.1 Layout Components

- [ ] Create `src/components/layout/Header.tsx` with navigation
- [ ] Create `src/components/layout/Sidebar.tsx` with menu
- [ ] Create `src/components/layout/MainLayout.tsx`
- [ ] Commit: `git commit -m "feat: implement layout components"`

### 4.2 Dashboard Components

- [ ] Create `src/components/dashboard/HealthScoreCard.tsx` - displays score with color coding
- [ ] Create `src/components/dashboard/NutritionSummaryCard.tsx` - macro/micro overview
- [ ] Create `src/components/dashboard/RecommendationsCard.tsx` - actionable suggestions
- [ ] Create `src/components/dashboard/TodaysMeals.tsx` - meal log list
- [ ] Create `src/components/dashboard/TodaysSupplements.tsx` - supplement checklist
- [ ] Commit: `git commit -m "feat: implement dashboard overview components"`

### 4.3 Form Components

- [ ] Create `src/components/forms/MealLogForm.tsx` - add/edit meals
- [ ] Create `src/components/forms/FoodSearchInput.tsx` - search and select foods
- [ ] Create `src/components/forms/SupplementCheckbox.tsx` - mark supplements taken
- [ ] Commit: `git commit -m "feat: implement meal and supplement logging forms"`

### 4.4 Chart Components

- [ ] Create `src/components/dashboard/MacroChart.tsx` - pie/bar chart for macros
- [ ] Create `src/components/dashboard/WeeklyTrendChart.tsx` - line chart for score over time
- [ ] Create `src/components/dashboard/MicronutrientGrid.tsx` - grid showing vitamin/mineral %
- [ ] Commit: `git commit -m "feat: implement data visualization components"`

---

## Phase 5: Pages & Routing

### 5.1 Dashboard Page

- [ ] Create `src/app/page.tsx` - main dashboard
- [ ] Show health score, daily summary, quick actions
- [ ] Commit: `git commit -m "feat: implement dashboard home page"`

### 5.2 Meal Logging Page

- [ ] Create `src/app/meals/page.tsx`
- [ ] Show meal log form, today's meals, food search
- [ ] Commit: `git commit -m "feat: implement meal logging page"`

### 5.3 Supplements Page

- [ ] Create `src/app/supplements/page.tsx`
- [ ] Show supplement list, daily checklist
- [ ] Commit: `git commit -m "feat: implement supplements tracking page"`

### 5.4 History/Timeline Page

- [ ] Create `src/app/history/page.tsx`
- [ ] Show calendar view, date selector, historical data
- [ ] Commit: `git commit -m "feat: implement history timeline page"`

### 5.5 Profile Settings Page

- [ ] Create `src/app/profile/page.tsx`
- [ ] Show/edit profile, allergies, health conditions
- [ ] Commit: `git commit -m "feat: implement profile settings page"`

### 5.6 Analytics Page

- [ ] Create `src/app/analytics/page.tsx`
- [ ] Show weekly/monthly trends, detailed charts
- [ ] Commit: `git commit -m "feat: implement analytics and trends page"`

---

## Phase 6: State Management & API Routes

### 6.1 Zustand Store Setup

- [ ] Create `src/lib/store/healthStore.ts`
- [ ] Define state: profile, dailyLog, supplements, loading states
- [ ] Implement actions: loadProfile, addMeal, toggleSupplement
- [ ] Commit: `git commit -m "feat: implement Zustand store for health data"`

### 6.2 API Routes for Data Fetching

- [ ] Create `src/app/api/profile/route.ts` - GET/PUT profile
- [ ] Create `src/app/api/meals/route.ts` - GET/POST meals
- [ ] Create `src/app/api/supplements/route.ts` - GET/POST supplement logs
- [ ] Create `src/app/api/daily-summary/[date]/route.ts` - GET daily summary
- [ ] Create `src/app/api/foods/search/route.ts` - GET search foods
- [ ] Commit: `git commit -m "feat: implement API routes for data operations"`

### 6.3 Custom Hooks

- [ ] Create `src/hooks/useProfile.ts`
- [ ] Create `src/hooks/useDailyLog.ts`
- [ ] Create `src/hooks/useHealthScore.ts`
- [ ] Commit: `git commit -m "feat: implement custom React hooks for data fetching"`

---

## Phase 7: Polish & UX Enhancements

### 7.1 Loading States

- [ ] Add skeleton loaders to all pages
- [ ] Add loading spinners for data fetching
- [ ] Commit: `git commit -m "feat: add loading states and skeleton screens"`

### 7.2 Error Handling

- [ ] Create error boundary components
- [ ] Add toast notifications for errors/success
- [ ] Implement form validation with error messages
- [ ] Commit: `git commit -m "feat: implement comprehensive error handling"`

### 7.3 Responsive Design

- [ ] Ensure mobile responsiveness for all pages
- [ ] Test on tablet and mobile breakpoints
- [ ] Commit: `git commit -m "feat: ensure responsive design across all breakpoints"`

### 7.4 Accessibility

- [ ] Add ARIA labels to interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Commit: `git commit -m "feat: improve accessibility with ARIA labels and keyboard nav"`

### 7.5 Performance Optimization

- [ ] Implement React.memo for expensive components
- [ ] Add database query optimization/indexes
- [ ] Lazy load charts and heavy components
- [ ] Commit: `git commit -m "perf: optimize component rendering and database queries"`

---

## Phase 8: Testing & Documentation

### 8.1 Unit Tests Setup

- [ ] Install testing libraries: `npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom`
- [ ] Create `jest.config.js`
- [ ] Create `src/__tests__/utils/` directory
- [ ] Write tests for: nutritionalCalculator, healthScoring, allergenChecker
- [ ] Commit: `git commit -m "test: add unit tests for utility functions"`

### 8.2 Integration Tests

- [ ] Write tests for repositories
- [ ] Test database operations
- [ ] Commit: `git commit -m "test: add integration tests for database repositories"`

### 8.3 Component Tests

- [ ] Write tests for key components
- [ ] Test form submissions and interactions
- [ ] Commit: `git commit -m "test: add component tests for UI"`

### 8.4 Update Documentation

- [ ] Update README with setup instructions
- [ ] Add JSDoc comments to key functions
- [ ] Create API documentation
- [ ] Commit: `git commit -m "docs: update documentation with setup and API reference"`

---

## Phase 9: MVP Launch Checklist

### 9.1 Final Testing

- [ ] Manual testing of all features
- [ ] Test with various data scenarios
- [ ] Test allergen warnings with foods containing user allergens
- [ ] Test scoring algorithm accuracy with edge cases
- [ ] Test date navigation and historical data
- [ ] Verify all form validations work correctly
- [ ] Test supplement checklist functionality
- [ ] Verify nutritional calculations are accurate

### 9.2 Data Backup Strategy

- [ ] Document backup process for `health.db` in README
- [ ] Create `scripts/backup.sh`:
  ```bash
  #!/bin/bash
  timestamp=$(date +%Y%m%d_%H%M%S)
  cp data/health.db "backups/health_backup_$timestamp.db"
  echo "Backup created: health_backup_$timestamp.db"
  ```
- [ ] Create `backups/` directory (add to .gitignore)
- [ ] Test restore process by copying backup back to `data/health.db`
- [ ] Add backup commands to package.json:
  ```json
  {
    "scripts": {
      "backup": "node scripts/backup.js",
      "restore": "node scripts/restore.js"
    }
  }
  ```
- [ ] Commit: `git commit -m "feat: add database backup and restore scripts"`

### 9.3 Performance Audit

- [ ] Run Lighthouse audit on all pages
- [ ] Check bundle size: `npm run build && npm run analyze`
- [ ] Optimize images if any are added
- [ ] Ensure database queries are indexed properly
- [ ] Check for unnecessary re-renders with React DevTools
- [ ] Optimize heavy calculations (memoize where appropriate)
- [ ] Commit: `git commit -m "perf: optimize performance based on audit results"`

### 9.4 Security Review

- [ ] Verify no sensitive data is logged to console in production
- [ ] Ensure database file permissions are correct (not world-readable)
- [ ] Check that API routes validate input properly
- [ ] Review Zod schemas for comprehensive validation
- [ ] Commit: `git commit -m "security: review and fix potential vulnerabilities"`

### 9.5 User Experience Polish

- [ ] Add helpful tooltips to complex features
- [ ] Ensure empty states are handled gracefully (no data yet)
- [ ] Add confirmation dialogs for destructive actions (delete meal)
- [ ] Smooth animations/transitions where appropriate
- [ ] Consistent spacing and typography
- [ ] Commit: `git commit -m "ux: polish user experience with tooltips and transitions"`

### 9.6 Final Code Cleanup

- [ ] Remove console.logs and debug code
- [ ] Remove unused imports and variables
- [ ] Remove commented-out code
- [ ] Ensure all TODOs in code are addressed or documented
- [ ] Run final lint: `npm run lint`
- [ ] Run final type check: `npx tsc --noEmit`
- [ ] Commit: `git commit -m "chore: final code cleanup and remove debug code"`

### 9.7 Documentation Finalization

- [ ] Update README.md with:
  - Complete setup instructions
  - How to seed the database
  - How to run the app
  - How to backup data
  - Screenshots of main pages
- [ ] Create CHANGELOG.md documenting MVP features
- [ ] Add inline code comments for complex logic
- [ ] Commit: `git commit -m "docs: finalize documentation for MVP launch"`

### 9.8 Launch Preparation

- [ ] Tag MVP release: `git tag -a v1.0.0 -m "MVP Release"`
- [ ] Push to remote: `git push origin main --tags`
- [ ] Create GitHub release notes (if using GitHub)
- [ ] Celebrate! 🎉

---

## Post-MVP: Future Enhancements (V2+)

### Future Phase 1: Bloodwork Integration

- [ ] Design bloodwork data model
- [ ] Create bloodwork upload/parsing functionality
- [ ] Integrate bloodwork markers with recommendations
- [ ] Track bloodwork changes over time

### Future Phase 2: Workout Tracking

- [ ] Design workout data model
- [ ] Create workout logging interface
- [ ] Calculate calories burned
- [ ] Adjust nutritional targets based on workout days
- [ ] Show workout history and trends

### Future Phase 3: Advanced Analytics

- [ ] Correlation analysis (meals vs health score)
- [ ] Predictive analytics for gout flares
- [ ] Weekly/monthly reports
- [ ] Export data to CSV/PDF
- [ ] Advanced charting (heatmaps, trends)

### Future Phase 4: Mobile Experience

- [ ] PWA configuration for offline support
- [ ] Mobile app (React Native or similar)
- [ ] Quick meal logging shortcuts
- [ ] Photo-based meal logging
- [ ] Push notifications for supplement reminders

### Future Phase 5: AI Integration

- [ ] Perplexity API for latest health research
- [ ] Smart meal suggestions based on gaps
- [ ] Natural language meal logging ("I had chicken and rice")
- [ ] Personalized research summaries

### Future Phase 6: Social/Sharing Features

- [ ] Export health reports to share with doctor
- [ ] Generate shareable health snapshots
- [ ] Import recipes from websites
- [ ] Meal planning feature

### Future Phase 7: Advanced Health Features

- [ ] Symptom correlation tracking
- [ ] Medication tracking and interactions
- [ ] Sleep quality tracking
- [ ] Stress/mood tracking
- [ ] Menstrual cycle tracking (if applicable)
- [ ] Blood glucose tracking integration

### Future Phase 8: Supabase Integration

- [ ] Move food database to Supabase
- [ ] Implement real-time sync
- [ ] Keep personal data local, food data remote
- [ ] Build admin panel for managing food database

---

## Development Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run format          # Run Prettier
npm run type-check      # Run TypeScript compiler check

# Database
npm run seed            # Seed database with mock data
npm run backup          # Backup database
npm run restore         # Restore database from backup

# Testing
npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report

# Git
git add .
git commit -m "type: description"  # Follow conventional commits
git push origin main
```

---

## Git Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `build:` - Build system changes
- `ci:` - CI/CD changes

Examples:

```bash
git commit -m "feat: add meal logging form component"
git commit -m "fix: correct nutritional calculation for vitamin D"
git commit -m "docs: update README with setup instructions"
git commit -m "perf: optimize database query for daily summary"
```

---

## Troubleshooting Guide

### Database Issues

**Problem**: Database is locked
**Solution**: Make sure no other process is accessing the database. Close all connections properly.

**Problem**: Seeding fails
**Solution**: Delete `data/health.db` and run `npm run seed` again.

### Type Errors

**Problem**: TypeScript errors on build
**Solution**: Run `npx tsc --noEmit` to see detailed type errors. Fix each one before building.

### Husky Hook Failures

**Problem**: Pre-commit hook fails
**Solution**: Fix linting/formatting errors shown. Run `npm run lint -- --fix` and `npm run format`.

### Performance Issues

**Problem**: Slow page loads
**Solution**: Check for unnecessary re-renders with React DevTools. Memoize expensive calculations.

---

## Project Metrics & Goals

### MVP Success Criteria

- ✅ Can log meals in under 30 seconds
- ✅ Health score updates in real-time
- ✅ Allergen warnings work 100% of the time
- ✅ All data persists between sessions
- ✅ UI is responsive on desktop (mobile in V2)
- ✅ No critical bugs on manual testing
- ✅ TypeScript builds without errors
- ✅ All tests pass

### Performance Targets

- Lighthouse Performance Score: > 90
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle Size: < 500KB (gzipped)

### Code Quality Targets

- TypeScript strict mode: enabled ✓
- Test coverage: > 70%
- ESLint errors: 0
- No console.logs in production

---

## Tech Stack Summary

**Frontend:**

- Next.js 14+ (App Router)
- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- shadcn/ui components

**Data Visualization:**

- Recharts

**State Management:**

- Zustand

**Database:**

- SQLite (better-sqlite3)
- Local storage only

**Validation:**

- Zod

**Date Handling:**

- date-fns

**Code Quality:**

- ESLint
- Prettier
- Husky
- lint-staged

**Testing:**

- Jest
- React Testing Library

---

## Quick Start After Setup

1. **Clone and Install**

   ```bash
   git clone <your-repo>
   cd personal-health-optimizer
   npm install
   ```

2. **Seed Database**

   ```bash
   npm run seed
   ```

3. **Start Development**

   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:3000`

5. **Start Logging**
   - View your dashboard with mock profile
   - Log your first meal
   - Check supplements
   - See your health score update!

---

## MVP Feature Checklist

### Core Features

- [x] User profile management
- [x] Food database with nutritional info
- [x] Meal logging (breakfast, lunch, dinner, snacks)
- [x] Supplement tracking with daily checklist
- [x] Allergen conflict detection
- [x] Daily nutritional summary
- [x] Health score calculation
- [x] Personalized recommendations
- [x] Historical data timeline
- [x] Macro/micro nutrient tracking
- [x] Charts and visualizations
- [x] Gout-specific considerations

### Pages

- [x] Dashboard (home)
- [x] Meal logging
- [x] Supplement tracking
- [x] History/timeline
- [x] Profile settings
- [x] Analytics

### Quality

- [x] TypeScript strict mode
- [x] Responsive design
- [x] Error handling
- [x] Loading states
- [x] Form validation
- [x] Accessibility (ARIA labels)
- [x] Unit tests
- [x] Integration tests
- [x] Documentation

---

## Estimated Timeline

**Phase 0-1**: 2-3 days (setup, database, types)
**Phase 2-3**: 3-4 days (repositories, business logic)
**Phase 4-5**: 4-5 days (UI components, pages)
**Phase 6**: 2-3 days (state management, API routes)
**Phase 7**: 2-3 days (polish, optimization)
**Phase 8**: 2-3 days (testing, documentation)
**Phase 9**: 1-2 days (final testing, launch prep)

**Total**: 16-23 days of focused development

---

## Notes for IDE Agent

- Always run `npm run lint` before committing
- Commit frequently with descriptive messages
- Test changes manually after each phase
- Keep commits atomic (one feature per commit)
- Use conventional commit format
- Run `npx tsc --noEmit` regularly to catch type errors early
- Refer to types in `src/lib/types/health.ts` for consistency
- Check `.gitignore` to ensure no sensitive data is committed
- Ask for clarification if requirements are ambiguous
- Prioritize working code over perfect code in MVP

Good luck! 🚀
