# Health Tracker 9000 - AI Assistant Guide

This document provides AI assistants with essential context about the Health Tracker 9000 codebase, architecture, conventions, and development patterns.

## 1. Project Overview

Health Tracker 9000 is a comprehensive web application for tracking personal health data, including nutritional intake, supplements, and health scores. The application is designed with a **privacy-first approach**, storing all data locally in SQLite with no cloud sync. Special considerations include gout management and allergen tracking for personalized health insights.

## 2. Tech Stack

- **Framework**: Next.js 16.1.3 (App Router)
- **Language**: TypeScript 5+ (strict mode enabled)
- **Runtime**: React 19.2.3
- **Database**: SQLite via better-sqlite3 12.6.2 (local-first, privacy-focused)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI primitives
- **State Management**: Zustand 5.0.10
- **Validation**: Zod 4.3.5
- **Charts**: Recharts 3.6.0
- **Icons**: Lucide React 0.562.0
- **Date Handling**: date-fns 4.1.0
- **Testing**: Jest 29.7.0 + React Testing Library 16.3.1
- **Code Quality**: ESLint 9, Prettier 3.8.0, Husky 9.1.7, lint-staged 16.2.7

## 3. Architecture & Directory Structure

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── api/          # API endpoints (foods, meals, supplements, profile, analytics)
│   │   ├── foods/
│   │   ├── meals/
│   │   ├── supplements/
│   │   ├── profile/
│   │   ├── analytics/
│   │   └── daily-summary/
│   ├── page.tsx      # Dashboard (home page)
│   ├── meals/        # Meal logging page
│   ├── supplements/  # Supplement management page
│   ├── profile/      # User profile page
│   ├── analytics/    # Analytics page
│   └── history/      # History page
├── components/       # React components organized by feature
│   ├── analytics/    # Analytics visualizations
│   ├── dashboard/    # Dashboard widgets
│   ├── forms/        # Form components (MealLogForm, etc.)
│   ├── layout/       # Layout components (Header, Sidebar, MainLayout)
│   ├── meals/        # Meal-related components
│   ├── profile/      # Profile components
│   ├── supplements/  # Supplement components
│   └── ui/           # shadcn/ui base components
├── lib/
│   ├── database/     # Database connection, schema, repositories
│   │   ├── connection.ts        # SQLite connection setup
│   │   ├── seed.ts              # Database seeding script
│   │   └── repositories/        # Repository pattern for data access
│   │       ├── mealLogRepository.ts
│   │       ├── supplementRepository.ts
│   │       ├── profileRepository.ts
│   │       ├── foodRepository.ts
│   │       └── dailySummaryRepository.ts
│   ├── store/        # Zustand state management stores
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Business logic and utility functions
├── hooks/            # Custom React hooks
├── constants/        # Application constants
└── data/             # Static data and seed data
```

## 4. Key Architectural Patterns

### Repository Pattern

All database operations go through repository classes to decouple business logic from data access.

**Location**: `src/lib/database/repositories/`

**Existing repositories:**
- `mealLogRepository.ts` - Meal logging CRUD operations
- `supplementRepository.ts` - Supplement management
- `profileRepository.ts` - User profile and health data
- `foodRepository.ts` - Food database queries
- `dailySummaryRepository.ts` - Aggregated daily health data

### API Routes Structure

- RESTful endpoints in `src/app/api/`
- Route handlers (`route.ts` files) use repositories for data access
- Server-side validation with Zod schemas
- Return appropriate HTTP status codes

### Component Organization

- Atomic design principles
- Functional components with React hooks
- Separation between UI components (`components/ui/`) and feature components
- Feature-specific components grouped by domain (dashboard, meals, supplements, etc.)
- TypeScript props interfaces for all components

## 5. Database Schema

Key tables:

- **`profile`** - User health profile (age, weight, height, conditions, allergies)
- **`nutritional_targets`** - Daily nutritional goals
- **`foods`** - Food database with nutritional info and allergens
- **`supplements`** - User's supplement list
- **`meal_logs`** - Daily meal entries (JSON column for foods array)
- **`supplement_logs`** - Daily supplement compliance tracking
- **`daily_summary`** - Aggregated daily health score and nutrition totals

**Important**: JSON columns are used for flexible data structures (allergens, nutrients arrays).

## 6. Code Conventions

### TypeScript

- Strict mode enabled in `tsconfig.json`
- Avoid `any` types - use proper TypeScript types
- Type definitions located in `src/lib/types/`
- Interfaces for component props, API responses, database models

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Example**: `feat: implement meal logging repository`

### Code Style

- **Prettier** for formatting (`.prettierrc.json`)
- **ESLint** for linting (`eslint.config.mjs`)
- **Pre-commit hooks** via Husky + lint-staged
- Auto-fixes formatting and linting issues on commit for staged files

## 7. Important Development Context

### Data Privacy Focus

- **All personal health data stored locally in SQLite** - no cloud storage
- Database file: `health.db` (gitignored, not committed)
- No authentication system - single-user app running locally
- Backup/restore functionality: `npm run db:backup` and `npm run db:restore`

### Health-Specific Features

- **Allergen conflict detection** - Critical safety feature before meal logging
- **Gout management** - Specific condition that influenced food tracking features
- **Health score algorithm** - Considers nutritional targets and supplement compliance
- **Micronutrient tracking** - Detailed vitamin and mineral tracking

### Testing Approach

- Jest for unit and integration tests
- React Testing Library for component tests
- Tests located in `src/__tests__/` mirroring source structure
- Test commands: `npm test` (single run), `npm run test:watch` (watch mode)

## 8. Common Development Tasks

### Running the App

```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Production server
```

### Database Operations

```bash
npm run seed                      # Seed database with mock data
npm run db:backup                 # Create timestamped backup
npm run db:restore [filename]     # Restore from backup
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
```

**Note**: Pre-commit hooks automatically run on `git commit`

## 9. Critical Files to Know

- `src/lib/database/connection.ts` - SQLite connection setup
- `src/lib/database/seed.ts` - Database seeding with mock data
- `src/lib/database/repositories/` - Data access layer (5 repositories)
- `src/lib/types/` - TypeScript type definitions
- `src/lib/store/` - Zustand state management stores
- `src/lib/utils/` - Business logic and utility functions
- `docs/API.md` - API endpoint documentation
- `docs/roadmap.md` - Project status and phases (currently Phase 9: MVP Launch)
- `docs/reference.md` - Development reference and conventions
- `DEVELOPMENT.md` - Development workflow and git conventions
- `README.md` - Project overview and getting started guide
- `package.json` - Dependencies and npm scripts
- `.prettierrc.json` - Code formatting configuration
- `eslint.config.mjs` - Linting configuration

## 10. Current Project Status

**Phase 9: MVP Launch** (active)

- ✅ Core features complete
- ✅ Testing and documentation complete
- ✅ Ready for production use

See `docs/roadmap.md` for detailed project phases and progress.

## 11. Working with This Codebase

### Before Making Changes

1. **Read existing code first** - Never propose changes without reading the relevant files
2. **Check existing patterns** - Look at similar components/features for consistency
3. **Run tests** - Ensure current test suite passes before making changes
4. **Review documentation** - Check `docs/reference.md` and `DEVELOPMENT.md` for conventions

### When Adding Features

1. **Use repository pattern** - All database access goes through repositories
2. **Add validation** - Use Zod schemas for data validation
3. **Follow naming conventions** - Match existing file and component naming
4. **Write tests** - Add tests in `src/__tests__/` mirroring source structure
5. **Update types** - Add/update TypeScript interfaces in `src/lib/types/`

### Common Patterns to Follow

- **API Routes**: Use Next.js App Router route handlers (`route.ts` files)
- **Components**: Functional components with TypeScript props interfaces
- **Styling**: Tailwind utility classes + shadcn/ui components
- **Data Fetching**: Use repositories → API routes → client components
- **State Management**: Zustand stores for global state, local state for component-specific data
- **Forms**: Controlled components with validation (see `MealLogForm` example in `src/components/forms/`)
- **Error Handling**: Try-catch in API routes, return appropriate HTTP status codes

### What NOT to Do

- ❌ Don't use `any` types - use proper TypeScript types
- ❌ Don't access database directly from components - use API routes + repositories
- ❌ Don't commit `health.db` - it's gitignored for privacy
- ❌ Don't skip pre-commit hooks - they enforce code quality
- ❌ Don't modify schema without migration strategy - data loss risk
- ❌ Don't add cloud sync features - privacy-first is a core principle
- ❌ Don't ignore ESLint/TypeScript errors - fix them before committing

## 12. Helpful Tips for AI Assistants

### Understanding the Data Flow

```
User Input → Component → API Route → Repository → SQLite Database
                ↓                           ↓
            Validation              Database Query
              (Zod)                 (better-sqlite3)
```

### Key Design Decisions

- **Local-first architecture**: All data stays on user's machine (privacy-focused)
- **Allergen safety**: Critical feature - must show warnings before meal logging
- **Health scoring**: Algorithm considers nutritional targets, supplement compliance
- **Gout management**: Specific condition that influenced food tracking features
- **No authentication**: Single-user app (runs locally)

### When Debugging

1. **Check database**: `health.db` in project root (if seeded)
2. **Check console**: Browser DevTools for client-side errors
3. **Check terminal**: Next.js dev server output for API route errors
4. **Check tests**: Run `npm test` to see if tests reveal the issue
5. **Check types**: Run `npx tsc --noEmit` for TypeScript errors

---

**Last Updated**: 2026-01-19
**Project Phase**: Phase 9 - MVP Launch
**For more information**: See `README.md`, `DEVELOPMENT.md`, and `docs/` directory
