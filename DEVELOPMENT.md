# Development Guide

This document outlines the development workflow and conventions for Health Tracker 9000.

## Development Workflow

1. **Task Tracking**: Refer to `docs/todo.md` for the current status of the project.
2. **Branching Strategy**: Use feature branches for new developments.
3. **Pre-commit Hooks**: Husky and lint-staged are configured to run ESLint and Prettier on every commit.

## Git Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: A new feature
- `fix`: A bug fix
- `chore`: Maintenance tasks, dependencies, etc.
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature

Example: `feat: implement meal logging repository`

## Code Style Guide

- **Formatting**: Managed by Prettier. Configuration in `.prettierrc.json`.
- **Linting**: Managed by ESLint. Configuration in `eslint.config.mjs`.
- **TypeScript**: Strict mode is enabled. Avoid `any` where possible.
- **Components**: Follow the atomic design principles for components. Prefer functional components and hooks.

## Database Management

- The project uses SQLite via `better-sqlite3`.
- Schema is defined in `src/lib/database/schema.sql`.
- Use the Repository pattern for database operations to decouple business logic from data access.
