# Implementation Plan: Claude Code Skills for Health Tracker 9000

## Overview

Implement 7 custom Claude Code skills to accelerate development on the Health Tracker 9000 project. Each skill automates repetitive boilerplate following existing project patterns.

---

## Implementation Steps

### Phase 1: Setup Skills Directory Structure

Create the project-level skills directory:

```
.claude/skills/
├── generate-api-route/
│   └── SKILL.md
├── generate-repository/
│   └── SKILL.md
├── generate-card/
│   └── SKILL.md
├── generate-store-action/
│   └── SKILL.md
├── generate-form/
│   └── SKILL.md
├── generate-test/
│   └── SKILL.md
└── add-feature/
    └── SKILL.md
```

### Phase 2: Create Individual Skills

#### Skill 1: `/generate-api-route`

**Impact**: ~40-50 lines of boilerplate per route
**File**: `.claude/skills/generate-api-route/SKILL.md`

**Frontmatter**:

```yaml
---
name: generate-api-route
description: Generate Next.js API route handler with repository integration, error handling, and TypeScript types. Use when creating new API endpoints for meals, supplements, profile, analytics, or other resources.
allowed-tools: Read, Write, Glob, Grep
---
```

**Instructions**: Generate complete route.ts file with:

- Import statements (NextResponse, repository class)
- GET handler (with query params extraction)
- POST handler (with body validation)
- DELETE handler (with ID validation)
- Daily summary recalculation for relevant endpoints
- Try-catch error handling with console.error
- Proper HTTP status codes

**Reference Pattern**: `src/app/api/meals/route.ts`

---

#### Skill 2: `/generate-repository`

**Impact**: ~80-100 lines per repository
**File**: `.claude/skills/generate-repository/SKILL.md`

**Frontmatter**:

```yaml
---
name: generate-repository
description: Generate repository class for SQLite data access with CRUD methods, row mapping, and TypeScript types. Use when creating new database tables or data access layers.
allowed-tools: Read, Write, Glob, Grep
---
```

**Instructions**: Generate repository class with:

- Database connection via getDatabase()
- getAll() method with row-to-type mapping
- getById() method with null handling
- add() method with UUID and timestamps
- update() method with Partial<T>
- delete() method
- Row mapping: snake_case DB → camelCase TypeScript
- JSON.parse() for complex fields

**Reference Pattern**: `src/lib/database/repositories/mealLogRepository.ts`

---

#### Skill 3: `/generate-card`

**Impact**: ~30-40 lines per card
**File**: `.claude/skills/generate-card/SKILL.md`

**Frontmatter**:

```yaml
---
name: generate-card
description: Generate dashboard card component with shadcn Card structure, TypeScript props, and optional sub-components. Use when creating new dashboard widgets or stat cards.
allowed-tools: Read, Write, Glob, Grep
---
```

**Instructions**: Generate card component with:

- 'use client' directive
- Card/CardHeader/CardTitle/CardContent imports
- Props interface (ComponentNameProps)
- Icon from lucide-react
- Optional: sub-component for list items
- Optional: Recharts integration for charts
- Optional: memo() for performance

**Reference Pattern**: `src/components/dashboard/HealthScoreCard.tsx`

---

#### Skill 4: `/generate-store-action`

**Impact**: ~20-25 lines per action
**File**: `.claude/skills/generate-store-action/SKILL.md`

**Frontmatter**:

```yaml
---
name: generate-store-action
description: Generate Zustand async action with loading/error states and toast notifications. Use when adding new API calls to the health store.
allowed-tools: Read, Edit, Grep
---
```

**Instructions**: Add action to existing store with:

- set({ isLoading: true, error: null }) before fetch
- fetch() with proper method/headers/body
- Response validation (!response.ok)
- State update with fetched data
- toast.success() on success
- toast.error() on failure
- set({ isLoading: false }) in finally

**Reference Pattern**: `src/lib/store/healthStore.ts` (existing actions)

---

#### Skill 5: `/generate-form`

**Impact**: ~60-80 lines per form
**File**: `.claude/skills/generate-form/SKILL.md`

**Frontmatter**:

```yaml
---
name: generate-form
description: Generate form component with validation, state management, and submit handling. Use when creating new data entry forms.
allowed-tools: Read, Write, Glob, Grep
---
```

**Instructions**: Generate form component with:

- 'use client' directive
- useState hooks for all form fields
- useHealthStore() integration
- Validation function
- handleSubmit with try-catch-toast
- Input components from shadcn/ui
- Button with loading state
- Optional: list management (add/remove items)

**Reference Pattern**: `src/components/forms/MealLogForm.tsx`

---

#### Skill 6: `/generate-test`

**Impact**: ~40-50 lines per test
**File**: `.claude/skills/generate-test/SKILL.md`

**Frontmatter**:

```yaml
---
name: generate-test
description: Generate Jest test suite with mocks and common test cases. Use when creating tests for components, repositories, or API routes.
allowed-tools: Read, Write, Glob, Grep
---
```

**Instructions**: Generate test file with:

- Jest mock setup for dependencies
- beforeEach cleanup
- Test cases: renders correctly, handles user interactions, shows error states
- React Testing Library patterns (render, screen, fireEvent)
- Mock data and mock functions
- Proper file location in `src/__tests__/` mirroring source structure

**Reference Pattern**: `src/__tests__/components/forms/MealLogForm.test.tsx`

---

#### Skill 7: `/add-feature`

**Impact**: Combines all previous skills
**File**: `.claude/skills/add-feature/SKILL.md`

**Frontmatter**:

```yaml
---
name: add-feature
description: Scaffold complete feature with types, repository, API routes, components, store actions, and tests. Use when adding major new functionality like water tracking, sleep tracking, etc.
allowed-tools: Read, Write, Glob, Grep, Edit
---
```

**Instructions**: Orchestrate full feature creation:

1. Ask user for feature details (name, fields, validation)
2. Create TypeScript types in `src/lib/types/`
3. Generate repository using /generate-repository
4. Generate API routes using /generate-api-route
5. Generate form component using /generate-form
6. Generate card component using /generate-card
7. Add store actions using /generate-store-action
8. Generate tests using /generate-test
9. Update imports/exports as needed

**Dependencies**: Uses skills 1-6

---

## Critical Implementation Requirements

### Pattern Adherence

Each skill MUST follow these project conventions (from CLAUDE.md):

1. **TypeScript**: Strict mode, no `any` types
2. **File naming**: camelCase for files, PascalCase for components
3. **Imports**: Use `@/` alias for src imports
4. **Error handling**: Try-catch with toast notifications
5. **Database access**: Always through repository pattern
6. **State management**: Zustand for global, local for component state
7. **Styling**: Tailwind utility classes + shadcn/ui components
8. **Validation**: Client-side validation before API calls

### Reference Files

Each skill should reference these existing implementations:

| Pattern        | Reference File                                        |
| -------------- | ----------------------------------------------------- |
| API Route      | `src/app/api/meals/route.ts`                          |
| Repository     | `src/lib/database/repositories/mealLogRepository.ts`  |
| Card Component | `src/components/dashboard/HealthScoreCard.tsx`        |
| Form Component | `src/components/forms/MealLogForm.tsx`                |
| Store Actions  | `src/lib/store/healthStore.ts`                        |
| Tests          | `src/__tests__/components/forms/MealLogForm.test.tsx` |

---

## Verification

After implementing each skill:

1. **Syntax check**: Ensure YAML frontmatter is valid
2. **Pattern match**: Compare generated code to reference files
3. **Test run**: Execute skill with example input
4. **Validation**: Verify TypeScript compilation succeeds
5. **Convention check**: Ensure follows CLAUDE.md guidelines

---

## File Locations

**All skills**: `.claude/skills/<skill-name>/SKILL.md` (project-level)

This makes skills available to all developers working on Health Tracker 9000.

---

## Detailed Skill Templates

### Example: generate-api-route SKILL.md

````markdown
---
name: generate-api-route
description: Generate Next.js API route handler with repository integration, error handling, and TypeScript types. Use when creating new API endpoints for meals, supplements, profile, analytics, or other resources.
allowed-tools: Read, Write, Glob, Grep
---

# Generate API Route

Generate a complete Next.js App Router API endpoint following Health Tracker 9000 patterns.

## Usage

When user requests to create a new API endpoint, ask for:

1. **Resource name** (e.g., "water-intake", "sleep-log")
2. **HTTP methods needed** (GET, POST, DELETE, etc.)
3. **Whether daily summary recalculation is needed**

## Implementation Pattern

Based on `src/app/api/meals/route.ts`:

### File Structure

```typescript
import { NextResponse } from 'next/server';
import { ResourceRepository } from '@/lib/database/repositories/resourceRepository';
import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { calculateHealthScore } from '@/lib/utils/healthScoring';
import { getDatabase } from '@/lib/database/connection';

export async function POST(request: Request) {
  const repo = new ResourceRepository();
  const summaryRepo = new DailySummaryRepository();

  try {
    const body = await request.json();
    const { date, ...otherFields } = body;

    const newRecord = repo.addResource({
      date,
      ...otherFields,
    });

    // Update daily summary if applicable
    const summary = await summaryRepo.getDailySummary(date);
    if (summary) {
      const profileRepo = new ProfileRepository();
      const targets = profileRepo.calculateNutritionalTargets();

      const records = repo.getResourcesByDate(date);
      const dailyTotals = summaryRepo.calculateDailyTotals(records, summary.supplements);

      const scoreBreakdown = calculateHealthScore(dailyTotals, targets, {
        ...summary,
        records,
        totalNutrition: dailyTotals,
      });

      summaryRepo.saveDailySummary({
        date,
        totalNutrition: dailyTotals,
        healthScore: scoreBreakdown.total,
      });
    }

    return NextResponse.json(newRecord);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const repo = new ResourceRepository();
  const summaryRepo = new DailySummaryRepository();

  try {
    // Get date before deleting to update summary
    const stmt = getDatabase().prepare('SELECT date FROM table_name WHERE id = ?');
    const row = stmt.get(id) as any;
    const date = row?.date;

    repo.deleteResource(id);

    if (date) {
      // Same daily summary update logic as POST
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```
````

## Steps

1. **Create directory**: `src/app/api/{resource-name}/`
2. **Create file**: `route.ts` in that directory
3. **Generate imports** based on methods needed
4. **Generate handlers** for requested HTTP methods
5. **Add daily summary recalculation** if health-related data
6. **Format with Prettier** (project uses Prettier)

## Key Conventions

- Use `NextResponse.json()` for all responses
- Always include try-catch with `console.error('API Error:', error)`
- Return proper HTTP status codes (400 for bad request, 500 for errors)
- Repository instances created at top of each handler
- Daily summary updates for date-based health data only

````

### Example: generate-repository SKILL.md

```markdown
---
name: generate-repository
description: Generate repository class for SQLite data access with CRUD methods, row mapping, and TypeScript types. Use when creating new database tables or data access layers.
allowed-tools: Read, Write, Glob, Grep
---

# Generate Repository

Generate a repository class for SQLite data access following the repository pattern.

## Usage

When user requests to create a repository, ask for:
1. **Entity name** (e.g., "WaterLog", "SleepLog")
2. **Table name** (snake_case, e.g., "water_logs", "sleep_logs")
3. **Fields** and their types
4. **Which fields are JSON** (arrays, objects, etc.)

## Implementation Pattern

Based on `src/lib/database/repositories/mealLogRepository.ts`:

```typescript
import { getDatabase } from '../connection';
import type { EntityType } from '@/lib/types/health';
import { v4 as uuidv4 } from 'uuid';

export class EntityRepository {
  private db = getDatabase();

  addEntity(data: Omit<EntityType, 'id' | 'createdAt'>): EntityType {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const newEntity = { ...data, id, createdAt };

    const stmt = this.db.prepare(\`
      INSERT INTO table_name (id, field1, field2, created_at)
      VALUES (?, ?, ?, ?)
    \`);

    stmt.run(
      newEntity.id,
      newEntity.field1,
      JSON.stringify(newEntity.field2), // for JSON fields
      newEntity.createdAt
    );

    return newEntity;
  }

  getEntitiesByDate(date: string): EntityType[] {
    const stmt = this.db.prepare('SELECT * FROM table_name WHERE date = ?');
    const rows = stmt.all(date) as any[];

    return rows.map((row) => ({
      id: row.id,
      date: row.date,
      field1: row.field_1,  // snake_case → camelCase
      field2: JSON.parse(row.field_2),  // JSON fields
      createdAt: row.created_at,
    }));
  }

  updateEntity(id: string, updates: Partial<EntityType>): void {
    const stmt = this.db.prepare('SELECT * FROM table_name WHERE id = ?');
    const current = stmt.get(id) as any;
    if (!current) throw new Error('Entity not found');

    // Handle updates with JSON serialization
    const updated = {
      ...current,
      ...updates,
      field_2: JSON.stringify(updates.field2 || JSON.parse(current.field_2)),
    };

    const updateStmt = this.db.prepare(\`
      UPDATE table_name SET
        field_1 = ?,
        field_2 = ?
      WHERE id = ?
    \`);

    updateStmt.run(updated.field_1, updated.field_2, id);
  }

  deleteEntity(id: string): void {
    const stmt = this.db.prepare('DELETE FROM table_name WHERE id = ?');
    stmt.run(id);
  }
}
````

## Steps

1. **Create file**: `src/lib/database/repositories/{entityName}Repository.ts`
2. **Generate class** with private db connection
3. **Generate CRUD methods** (add, get, update, delete)
4. **Add row mapping** for snake_case → camelCase conversion
5. **Handle JSON fields** with JSON.stringify/parse
6. **Export class** for use in API routes

## Key Conventions

- Class name: `{Entity}Repository` (PascalCase)
- Private `db` property via `getDatabase()`
- Use `uuid()` for IDs, ISO strings for timestamps
- Throw errors with descriptive messages
- Map DB columns (snake_case) to TS props (camelCase)

```

---

## Summary

This implementation plan creates 7 custom Claude Code skills that automate the most repetitive patterns in the Health Tracker 9000 codebase:

1. **generate-api-route** - Next.js API endpoints (~40-50 lines)
2. **generate-repository** - Data access layer (~80-100 lines)
3. **generate-card** - Dashboard components (~30-40 lines)
4. **generate-store-action** - Zustand actions (~20-25 lines)
5. **generate-form** - Form components (~60-80 lines)
6. **generate-test** - Test suites (~40-50 lines)
7. **add-feature** - Full feature scaffolding (combines all above)

Each skill follows existing project patterns (repository pattern, try-catch-toast error handling, TypeScript strict mode) and references real files from the codebase.

**Total estimated time saved**: ~300-400 lines of boilerplate per new feature.
```
