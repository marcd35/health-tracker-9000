# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-18

### Added

- **Core Dashboard**: Visual overview of health statistics, macro distribution, and daily health score.
- **Meal Logging**: Searchable food database and meal tracking with nutritional breakdown.
- **Supplement Tracking**: Daily checklist for supplement compliance.
- **Health Scoring**: Algorithm-driven daily score based on nutritional targets and adherence.
- **Allergen Alerts**: Real-time warnings for foods containing user-defined allergens with detailed tooltips.
- **Historical Analysis**: Weekly trends for health scores and weight.
- **Advanced Analytics**: Interactive charts with real data from the store.
- **UX Enhancements**: Helpful tooltips, improved empty states with quick-action buttons, and meal deletion confirmation.
- **Animations**: Smooth entry animations for all main pages.
- **Data Management**: Automated and manual database backup and restore system.
- **Responsive Design**: Mobile-friendly UI using Tailwind CSS and Radix UI components.

### Technical

- Built with **Next.js 15+** and **TypeScript**.
- **SQLite** database for local-first data storage.
- **Zustand** for state management.
- **Turbopack** optimized production build.

### Fixed

- Build errors related to unused React imports in Next.js 15+ environments.
- Database connection lock issues during production builds.
- Missing database indexing for performance optimization.
