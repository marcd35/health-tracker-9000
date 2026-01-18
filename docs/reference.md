# Project Reference & Conventions

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

---

## Project Metrics & Success Criteria

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
